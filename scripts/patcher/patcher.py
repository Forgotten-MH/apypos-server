import os
import subprocess
import argparse
import shutil
import struct
import re
import sys
from shutil import copyfile

VERSION = "V1.0.0-linux"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# --- Original URLs in libMHS.so ---
ORIGINAL_URL = b'https://mhxr-dispatch.s3-ap-northeast-1.amazonaws.com/'  # 54 bytes
ORIGINAL_URL2 = b'http://203.191.249.158:13000/'  # 28 bytes
ORI_HTTPS = b'https://%s'
ORI2_HTTPS = b'https://'

# --- Binary patch constants (arm64-v8a only) ---
# Patch 2: sSafetyNet::isComplete() — always return true
PATCH2_OFFSET = 0x1af90e4
PATCH2_EXPECTED = struct.pack('<IIII', 0xb9403c08, 0x7103211f, 0x1a9f17e0, 0xd65f03c0)
PATCH2_REPLACEMENT = struct.pack('<IIII', 0x52800020, 0xd65f03c0, 0xd503201f, 0xd503201f)

# Patch 3: sSafetyNet::move() — set state=200, jump to epilogue
PATCH3_OFFSET = 0x1af9074
PATCH3_EXPECTED_PROLOGUE = struct.pack('<IIII', 0xf81e0ff3, 0xa9017bfd, 0x910043fd, 0xaa0003f3)
PATCH3_PROLOGUE_OFFSET = 0x1af9064
PATCH3_REPLACEMENT = struct.pack('<III', 0x52801908, 0xb9003e68, 0x1400000f)

# --- Smali templates ---
SAFETYNET_STUB_SMALI = """\
.method public a(Landroid/content/Context;Ljp/co/capcom/android/explore/b$a;)I
    .locals 2

    # Set g = "" (result string)
    const-string v0, ""
    iput-object v0, p0, Ljp/co/capcom/android/explore/b;->g:Ljava/lang/String;

    # Set h = 0 (status code)
    const/4 v0, 0x0
    iput v0, p0, Ljp/co/capcom/android/explore/b;->h:I

    # Store callback in e
    iput-object p2, p0, Ljp/co/capcom/android/explore/b;->e:Ljp/co/capcom/android/explore/b$a;

    # Set d = 1 (in-progress)
    const/4 v1, 0x1
    iput v1, p0, Ljp/co/capcom/android/explore/b;->d:I

    # Invoke callback.a(0) immediately
    invoke-interface {p2, v0}, Ljp/co/capcom/android/explore/b$a;->a(I)V

    # Set d = 2 (complete)
    const/4 v1, 0x2
    iput v1, p0, Ljp/co/capcom/android/explore/b;->d:I

    # Return 0
    return v0
.end method"""

NETWORK_SECURITY_CONFIG_XML = """\
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
"""


def validate_ip(ip: str) -> bool:
    """Validate IP/hostname with optional :port."""
    pattern = r'^[a-zA-Z0-9._-]+(:\d{1,5})?$'
    if not re.match(pattern, ip):
        return False
    if len(ip) > 253:
        return False
    if ':' in ip:
        port = int(ip.split(':')[1])
        if port < 1 or port > 65535:
            return False
    return True


def validate_url_lengths(ip: str) -> None:
    """Verify new URL fits within each original URL's space."""
    new_url = b'http://' + ip.encode() + b'/'
    for label, original in [("dispatch S3 URL", ORIGINAL_URL), ("fallback IP URL", ORIGINAL_URL2)]:
        if len(new_url) > len(original):
            print(f"[-] New URL ({new_url!r}, {len(new_url)} bytes) exceeds {label} "
                  f"({original!r}, {len(original)} bytes)")
            sys.exit(1)
    print(f"[+] URL length OK: {new_url!r} ({len(new_url)} bytes) fits in both slots "
          f"(max {len(ORIGINAL_URL)}, min {len(ORIGINAL_URL2)})")


def check_java_installed() -> None:
    """Check if Java is available."""
    try:
        subprocess.run(['java', '-version'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        print("[+] Java is installed.")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("[-] Java is not installed or not available in the system PATH.")
        sys.exit(1)


def unpack_apk(apk_file: str, decompiled_dir: str, apktool_cmd: list[str],
               signed_dir: str) -> None:
    """Unpack APK with apktool, cleaning up previous outputs."""
    for d in [decompiled_dir, signed_dir, os.path.join(SCRIPT_DIR, "patched")]:
        if os.path.exists(d):
            print(f"[*] Deleting existing directory: {d}")
            shutil.rmtree(d)

    print("[*] Unpacking APK...")
    subprocess.run(apktool_cmd + ['d', apk_file, '-o', decompiled_dir], check=True)
    print("[+] APK unpacked.")


def cleanup(decompiled_dir: str) -> None:
    """Remove temporary directories."""
    for d in [decompiled_dir, os.path.join(SCRIPT_DIR, "patched")]:
        if os.path.exists(d):
            shutil.rmtree(d)
            print(f"[+] Cleaned up {d}")


# ---------------------------------------------------------------------------
# Patch 1: Dispatch URL redirect (both architectures)
# ---------------------------------------------------------------------------
def patch_so_urls(decompiled_dir: str, ip: str, dry_run: bool) -> None:
    """Replace hardcoded URLs in libMHS.so for both arm64-v8a and armeabi-v7a."""
    new_url = b'http://' + ip.encode() + b'/'
    new_http = b'http://%s'
    new_http_scheme = b'http://'

    so_files = [
        os.path.join(decompiled_dir, 'lib/arm64-v8a/libMHS.so'),
        os.path.join(decompiled_dir, 'lib/armeabi-v7a/libMHS.so'),
    ]

    replacements = [
        (ORIGINAL_URL, new_url, "dispatch S3 URL"),
        (ORIGINAL_URL2, new_url, "fallback IP URL"),
        (ORI_HTTPS, new_http, "https format string"),
        (ORI2_HTTPS, new_http_scheme, "https scheme"),
    ]

    for so_path in so_files:
        arch = "arm64-v8a" if "arm64" in so_path else "armeabi-v7a"
        if not os.path.exists(so_path):
            print(f"[*] {arch}/libMHS.so not found, skipping.")
            continue

        with open(so_path, 'rb') as f:
            data = bytearray(f.read())

        modified = False
        for original, replacement, label in replacements:
            idx = data.find(original)
            if idx == -1:
                # Check if already patched
                padded_replacement = replacement + b'\x00' * (len(original) - len(replacement))
                if data.find(padded_replacement) != -1:
                    print(f"[*] Patch 1 ({arch}): {label} already patched, skipping.")
                else:
                    print(f"[-] Patch 1 ({arch}): {label} not found.")
                continue
            padded = replacement.ljust(len(original), b'\x00')
            if dry_run:
                print(f"[~] Patch 1 ({arch}): Would replace {label} at offset 0x{idx:x}")
            else:
                data[idx:idx + len(original)] = padded
                modified = True
                print(f"[+] Patch 1 ({arch}): Replaced {label} at offset 0x{idx:x}")

        if modified and not dry_run:
            with open(so_path, 'wb') as f:
                f.write(data)


# ---------------------------------------------------------------------------
# Patches 2+3: SafetyNet native bypasses (arm64-v8a only)
# ---------------------------------------------------------------------------
def patch_safetynet_native(decompiled_dir: str, dry_run: bool) -> None:
    """Apply SafetyNet binary patches to arm64-v8a libMHS.so."""
    so_path = os.path.join(decompiled_dir, 'lib/arm64-v8a/libMHS.so')
    if not os.path.exists(so_path):
        print("[-] Patch 2+3: arm64-v8a/libMHS.so not found!")
        sys.exit(1)

    with open(so_path, 'rb') as f:
        data = bytearray(f.read())

    modified = False

    # --- Patch 2: isComplete() ---
    current2 = bytes(data[PATCH2_OFFSET:PATCH2_OFFSET + 16])
    if current2 == PATCH2_REPLACEMENT:
        print("[*] Patch 2 (isComplete): Already applied, skipping.")
    elif current2 == PATCH2_EXPECTED:
        if dry_run:
            print("[~] Patch 2 (isComplete): Would patch at offset "
                  f"0x{PATCH2_OFFSET:x} (16 bytes)")
        else:
            data[PATCH2_OFFSET:PATCH2_OFFSET + 16] = PATCH2_REPLACEMENT
            modified = True
            print(f"[+] Patch 2 (isComplete): Patched at 0x{PATCH2_OFFSET:x}")
    else:
        print(f"[-] Patch 2 (isComplete): Unexpected bytes at 0x{PATCH2_OFFSET:x}:")
        print(f"    Expected: {PATCH2_EXPECTED.hex()}")
        print(f"    Found:    {current2.hex()}")
        sys.exit(1)

    # --- Patch 3: move() ---
    # Verify prologue first
    prologue = bytes(data[PATCH3_PROLOGUE_OFFSET:PATCH3_PROLOGUE_OFFSET + 16])
    if prologue != PATCH3_EXPECTED_PROLOGUE:
        # Could be already patched — check the patch target
        current3 = bytes(data[PATCH3_OFFSET:PATCH3_OFFSET + 12])
        if current3 == PATCH3_REPLACEMENT:
            print("[*] Patch 3 (move): Already applied, skipping.")
        else:
            print(f"[-] Patch 3 (move): Unexpected prologue at 0x{PATCH3_PROLOGUE_OFFSET:x}:")
            print(f"    Expected: {PATCH3_EXPECTED_PROLOGUE.hex()}")
            print(f"    Found:    {prologue.hex()}")
            sys.exit(1)
    else:
        current3 = bytes(data[PATCH3_OFFSET:PATCH3_OFFSET + 12])
        if current3 == PATCH3_REPLACEMENT:
            print("[*] Patch 3 (move): Already applied, skipping.")
        elif dry_run:
            print(f"[~] Patch 3 (move): Would patch at offset 0x{PATCH3_OFFSET:x} (12 bytes)")
        else:
            data[PATCH3_OFFSET:PATCH3_OFFSET + 12] = PATCH3_REPLACEMENT
            modified = True
            print(f"[+] Patch 3 (move): Patched at 0x{PATCH3_OFFSET:x}")

    if modified and not dry_run:
        with open(so_path, 'wb') as f:
            f.write(data)


# ---------------------------------------------------------------------------
# Patch 4: SafetyNet Java stub (b.smali)
# ---------------------------------------------------------------------------
def patch_safetynet_smali(decompiled_dir: str, dry_run: bool) -> None:
    """Replace SafetyNet attestation method in b.smali with a stub."""
    smali_path = os.path.join(
        decompiled_dir,
        'smali/jp/co/capcom/android/explore/b.smali'
    )
    if not os.path.exists(smali_path):
        print("[-] Patch 4: b.smali not found!")
        sys.exit(1)

    with open(smali_path, 'r') as f:
        content = f.read()

    # Match the method signature through .end method
    pattern = (
        r'(\.method public a\(Landroid/content/Context;'
        r'Ljp/co/capcom/android/explore/b\$a;\)I'
        r'.*?\.end method)'
    )
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        # Check if already stubbed
        if 'invoke-interface {p2, v0}, Ljp/co/capcom/android/explore/b$a;->a(I)V' in content:
            print("[*] Patch 4 (b.smali): Already patched, skipping.")
            return
        print("[-] Patch 4: Target method not found in b.smali!")
        sys.exit(1)

    if dry_run:
        print("[~] Patch 4 (b.smali): Would replace SafetyNet attestation method")
        return

    content = content[:match.start()] + SAFETYNET_STUB_SMALI + content[match.end():]
    with open(smali_path, 'w') as f:
        f.write(content)
    print("[+] Patch 4 (b.smali): Replaced attestation method with stub.")


# ---------------------------------------------------------------------------
# Patch 5: Google Play Services bypass (optional)
# ---------------------------------------------------------------------------
def patch_gms_bypass(decompiled_dir: str, dry_run: bool) -> None:
    """Stub GMS-dependent methods to prevent crashes without Google Play Services."""

    # 5a: GameHelper.onActivityResult — return immediately
    gamehelper_path = os.path.join(
        decompiled_dir,
        'smali/com/google/example/games/basegameutils/GameHelper.smali'
    )
    if os.path.exists(gamehelper_path):
        with open(gamehelper_path, 'r') as f:
            content = f.read()

        pattern = (
            r'(\.method public onActivityResult\(IILandroid/content/Intent;\)V'
            r'.*?\.end method)'
        )
        match = re.search(pattern, content, re.DOTALL)
        if match:
            stub = (
                ".method public onActivityResult(IILandroid/content/Intent;)V\n"
                "    .locals 0\n"
                "\n"
                "    return-void\n"
                ".end method"
            )
            if dry_run:
                print("[~] Patch 5a (GameHelper): Would stub onActivityResult")
            else:
                content = content[:match.start()] + stub + content[match.end():]
                with open(gamehelper_path, 'w') as f:
                    f.write(content)
                print("[+] Patch 5a (GameHelper): Stubbed onActivityResult.")
        else:
            print("[*] Patch 5a (GameHelper): onActivityResult not found or already stubbed.")
    else:
        print("[*] Patch 5a: GameHelper.smali not found, skipping.")

    # 5b: MTFPActivity — stub FCM registration methods
    mtfp_path = os.path.join(
        decompiled_dir,
        'smali/jp/co/capcom/mtframework/android/MTFPActivity.smali'
    )
    if os.path.exists(mtfp_path):
        with open(mtfp_path, 'r') as f:
            content = f.read()

        modified = False
        for method_name in ['sendRegistrationIdToBackend', 'getRegistrationId']:
            # sendRegistrationIdToBackend returns void
            pattern_void = (
                rf'(\.method[^\n]* {method_name}\([^)]*\)V'
                r'.*?\.end method)'
            )
            match = re.search(pattern_void, content, re.DOTALL)
            if match:
                stub = (
                    f'{match.group().split(chr(10))[0]}\n'
                    f'    .locals 0\n'
                    f'\n'
                    f'    return-void\n'
                    f'.end method'
                )
                if dry_run:
                    print(f"[~] Patch 5b (MTFPActivity): Would stub {method_name} (void)")
                else:
                    content = content[:match.start()] + stub + content[match.end():]
                    modified = True
                    print(f"[+] Patch 5b (MTFPActivity): Stubbed {method_name} (void).")
                continue

            # getRegistrationId returns String
            pattern_str = (
                rf'(\.method[^\n]* {method_name}\([^)]*\)Ljava/lang/String;'
                r'.*?\.end method)'
            )
            match = re.search(pattern_str, content, re.DOTALL)
            if match:
                stub = (
                    f'{match.group().split(chr(10))[0]}\n'
                    f'    .locals 1\n'
                    f'\n'
                    f'    const-string v0, ""\n'
                    f'\n'
                    f'    return-object v0\n'
                    f'.end method'
                )
                if dry_run:
                    print(f"[~] Patch 5b (MTFPActivity): Would stub {method_name} (String)")
                else:
                    content = content[:match.start()] + stub + content[match.end():]
                    modified = True
                    print(f"[+] Patch 5b (MTFPActivity): Stubbed {method_name} (String).")
                continue

            print(f"[*] Patch 5b: {method_name} not found in MTFPActivity.smali, skipping.")

        if modified and not dry_run:
            with open(mtfp_path, 'w') as f:
                f.write(content)
    else:
        print("[*] Patch 5b: MTFPActivity.smali not found, skipping.")


# ---------------------------------------------------------------------------
# Patch 6: Allow cleartext HTTP traffic
# ---------------------------------------------------------------------------
def patch_manifest_and_netsec(decompiled_dir: str, dry_run: bool) -> None:
    """Add cleartext traffic, debuggable flag, and network security config."""
    manifest_path = os.path.join(decompiled_dir, 'AndroidManifest.xml')
    if not os.path.exists(manifest_path):
        print("[-] Patch 6: AndroidManifest.xml not found!")
        sys.exit(1)

    with open(manifest_path, 'r') as f:
        content = f.read()

    modified = False

    # Insert android:usesCleartextTraffic="true" if missing
    if 'android:usesCleartextTraffic' not in content:
        content = re.sub(
            r'(<application\b)',
            r'\1 android:usesCleartextTraffic="true"',
            content,
            count=1,
        )
        modified = True
        if dry_run:
            print("[~] Patch 6: Would add usesCleartextTraffic to manifest")
        else:
            print("[+] Patch 6: Added usesCleartextTraffic to manifest.")
    else:
        print("[*] Patch 6: usesCleartextTraffic already present.")

    # Insert android:debuggable="true" if missing
    if 'android:debuggable' not in content:
        content = re.sub(
            r'(<application\b)',
            r'\1 android:debuggable="true"',
            content,
            count=1,
        )
        modified = True
        if dry_run:
            print("[~] Patch 6: Would add debuggable to manifest")
        else:
            print("[+] Patch 6: Added debuggable to manifest.")
    else:
        print("[*] Patch 6: debuggable already present.")

    # Insert android:networkSecurityConfig if missing
    if 'android:networkSecurityConfig' not in content:
        content = re.sub(
            r'(<application\b)',
            r'\1 android:networkSecurityConfig="@xml/network_security_config"',
            content,
            count=1,
        )
        modified = True
        if dry_run:
            print("[~] Patch 6: Would add networkSecurityConfig to manifest")
        else:
            print("[+] Patch 6: Added networkSecurityConfig to manifest.")
    else:
        print("[*] Patch 6: networkSecurityConfig already present.")

    if modified and not dry_run:
        with open(manifest_path, 'w') as f:
            f.write(content)

    # Create network_security_config.xml
    xml_dir = os.path.join(decompiled_dir, 'res', 'xml')
    xml_path = os.path.join(xml_dir, 'network_security_config.xml')
    if not os.path.exists(xml_path):
        if dry_run:
            print("[~] Patch 6: Would create res/xml/network_security_config.xml")
        else:
            os.makedirs(xml_dir, exist_ok=True)
            with open(xml_path, 'w') as f:
                f.write(NETWORK_SECURITY_CONFIG_XML)
            print("[+] Patch 6: Created res/xml/network_security_config.xml")
    else:
        print("[*] Patch 6: network_security_config.xml already exists.")


# ---------------------------------------------------------------------------
# Patch 7: Debug logging (optional)
# ---------------------------------------------------------------------------
def patch_debug_logging(decompiled_dir: str, dry_run: bool) -> None:
    """Enable MT Framework debug logging."""

    # 7a: Remove MtBuildMode gate checks in d.smali
    d_smali_path = os.path.join(
        decompiled_dir,
        'smali/jp/co/capcom/android/explore/d.smali'
    )
    if os.path.exists(d_smali_path):
        with open(d_smali_path, 'r') as f:
            content = f.read()

        # Remove all "sget-boolean ... MtBuildMode;->a:Z" + "if-eqz" guard patterns
        # These gates prevent logging when MtBuildMode.a is false
        pattern = (
            r'    sget-boolean ([vp]\d+), '
            r'Ljp/co/capcom/android/explore/MtBuildMode;->a:Z\n'
            r'    if-eqz \1, :cond_\w+\n'
        )
        count = len(re.findall(pattern, content))
        if count > 0:
            if dry_run:
                print(f"[~] Patch 7a (d.smali): Would remove {count} MtBuildMode gate(s)")
            else:
                content = re.sub(pattern, '', content)
                with open(d_smali_path, 'w') as f:
                    f.write(content)
                print(f"[+] Patch 7a (d.smali): Removed {count} MtBuildMode gate(s).")
        else:
            print("[*] Patch 7a (d.smali): No MtBuildMode gates found (already patched?).")
    else:
        print("[!] Patch 7a: d.smali not found, skipping.")

    # 7b: Set a=true, b=false in MtBuildMode.smali static initializer
    buildmode_path = os.path.join(
        decompiled_dir,
        'smali/jp/co/capcom/android/explore/MtBuildMode.smali'
    )
    if os.path.exists(buildmode_path):
        with open(buildmode_path, 'r') as f:
            content = f.read()

        modified = False

        # Set field a (develop mode) to true: const/4 vN, 0x0 → const/4 vN, 0x1
        # followed by sput-boolean vN, MtBuildMode;->a:Z
        pattern_a = (
            r'(    const/4 [vp]\d+, )0x0(\n'
            r'    sput-boolean [vp]\d+, '
            r'Ljp/co/capcom/android/explore/MtBuildMode;->a:Z)'
        )
        if re.search(pattern_a, content):
            if dry_run:
                print("[~] Patch 7b (MtBuildMode): Would set a=true (develop mode)")
            else:
                content = re.sub(pattern_a, r'\g<1>0x1\2', content)
                modified = True
                print("[+] Patch 7b (MtBuildMode): Set a=true (develop mode).")
        else:
            print("[*] Patch 7b (MtBuildMode): Field 'a' already true or pattern not found.")

        # Set field b (master mode) to false: const/4 vN, 0x1 → const/4 vN, 0x0
        # followed by sput-boolean vN, MtBuildMode;->b:Z
        pattern_b = (
            r'(    const/4 [vp]\d+, )0x1(\n'
            r'    sput-boolean [vp]\d+, '
            r'Ljp/co/capcom/android/explore/MtBuildMode;->b:Z)'
        )
        if re.search(pattern_b, content):
            if dry_run:
                print("[~] Patch 7b (MtBuildMode): Would set b=false (not master)")
            else:
                content = re.sub(pattern_b, r'\g<1>0x0\2', content)
                modified = True
                print("[+] Patch 7b (MtBuildMode): Set b=false (not master).")
        else:
            print("[*] Patch 7b (MtBuildMode): Field 'b' already false or pattern not found.")

        if modified and not dry_run:
            with open(buildmode_path, 'w') as f:
                f.write(content)
    else:
        print("[!] Patch 7b: MtBuildMode.smali not found, skipping.")


# ---------------------------------------------------------------------------
# Asset replacements (optional, from local files)
# ---------------------------------------------------------------------------
def replace_optional_assets(decompiled_dir: str, dry_run: bool) -> None:
    """Replace notice.png and GUI_msg.arc if present in patcher directory."""
    assets = [
        ('notice.png', os.path.join(decompiled_dir, 'res/drawable/notice.png')),
        ('GUI_msg.arc', os.path.join(decompiled_dir, 'assets/nativeAndroid/arc_cmn/GUI/GUI_msg.arc')),
    ]
    for filename, dest_path in assets:
        src_path = os.path.join(SCRIPT_DIR, filename)
        if not os.path.exists(src_path):
            continue
        if not os.path.exists(dest_path):
            print(f"[*] {dest_path} does not exist in APK, skipping {filename}.")
            continue
        if dry_run:
            print(f"[~] Would replace {filename}")
        else:
            copyfile(src_path, dest_path)
            print(f"[+] Replaced {filename}.")


# ---------------------------------------------------------------------------
# Build and sign
# ---------------------------------------------------------------------------
def repack_apk(decompiled_dir: str, apk_output: str, apktool_cmd: list[str]) -> None:
    os.makedirs(os.path.dirname(apk_output), exist_ok=True)
    print("[*] Repacking APK...")
    subprocess.run(apktool_cmd + ['b', '-o', apk_output, decompiled_dir], check=True)
    print(f"[+] APK repacked as {apk_output}.")


def sign_apk(apk_output: str, signed_dir: str) -> None:
    uber_signer = os.path.join(SCRIPT_DIR, 'uber-apk-signer-1.3.0.jar')
    print("[*] Signing APK...")
    subprocess.run(['java', '-jar', uber_signer, '-a', apk_output, '-out', signed_dir], check=True)
    print(f"[+] APK signed and saved to {signed_dir}.")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main() -> None:
    parser = argparse.ArgumentParser(
        description="Patches an Android MHXR APK for use with the Apypos private server"
    )
    parser.add_argument("-i", "--input", required=True, help="Path to input APK file")
    parser.add_argument("-ip", "--ip", required=True, help="Server IP or hostname:port")
    parser.add_argument("--gms-bypass", action="store_true",
                        help="Apply Google Play Services bypass (Patch 5)")
    parser.add_argument("--debug-logging", action="store_true",
                        help="Enable MT Framework debug logging (Patch 7)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Show what would be patched without modifying files")
    args = parser.parse_args()

    print(f"""\
███╗   ███╗██╗  ██╗██╗  ██╗██████╗     ██████╗  █████╗ ████████╗ ██████╗██╗  ██╗███████╗██████╗
████╗ ████║██║  ██║╚██╗██╔╝██╔══██╗    ██╔══██╗██╔══██╗╚══██╔══╝██╔════╝██║  ██║██╔════╝██╔══██╗
██╔████╔██║███████║ ╚███╔╝ ██████╔╝    ██████╔╝███████║   ██║   ██║     ███████║█████╗  ██████╔╝
██║╚██╔╝██║██╔══██║ ██╔██╗ ██╔══██╗    ██╔═══╝ ██╔══██║   ██║   ██║     ██╔══██║██╔══╝  ██╔══██╗
██║ ╚═╝ ██║██║  ██║██╔╝ ██╗██║  ██║    ██║     ██║  ██║   ██║   ╚██████╗██║  ██║███████╗██║  ██║
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝    ╚═╝     ╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
{VERSION}
""")

    if args.dry_run:
        print("=== DRY RUN MODE — no files will be modified ===\n")

    # Validate inputs
    if not validate_ip(args.ip):
        print(f"[-] Invalid IP/hostname: {args.ip!r}")
        sys.exit(1)

    validate_url_lengths(args.ip)
    check_java_installed()

    apk_file = os.path.abspath(args.input)
    if not os.path.exists(apk_file):
        print(f"[-] APK not found: {apk_file}")
        sys.exit(1)

    decompiled_dir = apk_file.replace(".apk", "")
    apk_output = os.path.join(SCRIPT_DIR, "patched",
                              os.path.basename(decompiled_dir) + '-patched.apk')
    signed_dir = os.path.join(SCRIPT_DIR, 'out')
    apktool_jar = os.path.join(SCRIPT_DIR, 'apktool_2.9.3.jar')
    apktool_cmd = ['java', '-jar', apktool_jar]

    try:
        # Step 1: Unpack
        unpack_apk(apk_file, decompiled_dir, apktool_cmd, signed_dir)

        # Step 2: Required patches (1-4, 6) — failure exits
        print("\n--- Patch 1: Dispatch URL redirect ---")
        patch_so_urls(decompiled_dir, args.ip, args.dry_run)

        print("\n--- Patches 2+3: SafetyNet native bypasses ---")
        patch_safetynet_native(decompiled_dir, args.dry_run)

        print("\n--- Patch 4: SafetyNet Java stub ---")
        patch_safetynet_smali(decompiled_dir, args.dry_run)

        print("\n--- Patch 6: Cleartext HTTP traffic ---")
        patch_manifest_and_netsec(decompiled_dir, args.dry_run)

        # Step 3: Optional patches (5, 7) — failure warns but continues
        if args.gms_bypass:
            print("\n--- Patch 5: Google Play Services bypass ---")
            try:
                patch_gms_bypass(decompiled_dir, args.dry_run)
            except Exception as e:
                print(f"[!] Patch 5 failed (non-fatal): {e}")

        if args.debug_logging:
            print("\n--- Patch 7: Debug logging ---")
            try:
                patch_debug_logging(decompiled_dir, args.dry_run)
            except Exception as e:
                print(f"[!] Patch 7 failed (non-fatal): {e}")

        # Step 4: Optional asset replacements
        print("\n--- Optional asset replacements ---")
        replace_optional_assets(decompiled_dir, args.dry_run)

        # Step 5: Repack and sign (skip in dry-run)
        if args.dry_run:
            print("\n=== DRY RUN COMPLETE — no files were modified ===")
            cleanup(decompiled_dir)
            return

        print()
        repack_apk(decompiled_dir, apk_output, apktool_cmd)
        sign_apk(apk_output, signed_dir)
        cleanup(decompiled_dir)

        print("\n" + "=" * 60)
        print(f"  PATCHED APK: {signed_dir}/")
        print("=" * 60 + "\n")

    except Exception as e:
        print(f"\n[-] Fatal error: {e}")
        cleanup(decompiled_dir)
        sys.exit(1)


if __name__ == '__main__':
    main()
