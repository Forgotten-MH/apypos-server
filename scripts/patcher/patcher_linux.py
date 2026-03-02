import os
import subprocess
import argparse
import shutil
import sys
from shutil import copyfile

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Create the argument parser
parser = argparse.ArgumentParser(description="Patches an Android MHXR APK with the specified IP (Linux version)")

# Add arguments for input and output
parser.add_argument("-i", "--input", required=True, help="Path to the input APK file")
parser.add_argument("-ip", "--ip", required=True, help="New IP to replace the original URL")

args = parser.parse_args()
APKTOOL_JAR = os.path.join(SCRIPT_DIR, 'apktool_2.9.3.jar')
APKTOOL_CMD = ['java', '-jar', APKTOOL_JAR]
APK_FILE = os.path.abspath(args.input)
IP = args.ip
DECOMPILED_DIR = APK_FILE.replace(".apk", "")
APK_OUTPUT = os.path.join(SCRIPT_DIR, "patched", os.path.basename(DECOMPILED_DIR) + '-patched.apk')
SIGNED_APK_OUTPUT_DIR = os.path.join(SCRIPT_DIR, 'out')
UBER_SIGNER_JAR = os.path.join(SCRIPT_DIR, 'uber-apk-signer-1.3.0.jar')
SO_FILES = [
    '/lib/arm64-v8a/libMHS.so',
    '/lib/armeabi-v7a/libMHS.so'
]
ORIGINAL_URL = b'https://mhxr-dispatch.s3-ap-northeast-1.amazonaws.com/'
ORIGINAL_URL2 = b'http://203.191.249.158:13000/'
NEW_URL = b'http://' + IP.encode() + b"/"
NEW_URL2 = b'http://' + IP.encode() + b"/"
ORI_HTTPS = b'https://%s'
NEW_HTTP = b'http://%s'
ORI2_HTTPS = b'https://'
NEW2_HTTP = b'http://'


def replace_gui_msg():
    new_image_path = os.path.join(SCRIPT_DIR, 'GUI_msg.arc')
    dest_image_path = os.path.join(DECOMPILED_DIR, 'assets/nativeAndroid/arc_cmn/GUI/GUI_msg.arc')

    if not os.path.exists(new_image_path):
        print(f"[*] {new_image_path} not found, skipping GUI_msg.arc replacement.")
        return

    if os.path.exists(dest_image_path):
        print(f"[*] Replacing {dest_image_path} with {new_image_path}")
        copyfile(new_image_path, dest_image_path)
        print(f"[+] Replaced {dest_image_path}.")
    else:
        print(f"[-] {dest_image_path} does not exist in the decompiled APK, skipping.")


def replace_notice_image():
    new_image_path = os.path.join(SCRIPT_DIR, 'notice.png')
    dest_image_path = os.path.join(DECOMPILED_DIR, 'res/drawable/notice.png')

    if not os.path.exists(new_image_path):
        print(f"[*] {new_image_path} not found, skipping notice.png replacement.")
        return

    if os.path.exists(dest_image_path):
        print(f"[*] Replacing {dest_image_path} with {new_image_path}")
        copyfile(new_image_path, dest_image_path)
        print(f"[+] Replaced {dest_image_path}.")
    else:
        print(f"[-] {dest_image_path} does not exist in the decompiled APK, skipping.")


def check_java_installed():
    """Check if Java is installed and available in the system path."""
    try:
        subprocess.run(['java', '-version'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        print("[+] Java is installed.")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("[-] Java is not installed or not available in the system PATH.")
        sys.exit(1)


def unpack_apk():
    if os.path.exists(DECOMPILED_DIR):
        print(f"[*] Deleting existing directory: {DECOMPILED_DIR}")
        shutil.rmtree(DECOMPILED_DIR)
        print(f"[+] Deleted {DECOMPILED_DIR}")
    if os.path.exists(SIGNED_APK_OUTPUT_DIR):
        print(f"[*] Deleting existing directory: {SIGNED_APK_OUTPUT_DIR}")
        shutil.rmtree(SIGNED_APK_OUTPUT_DIR)
        print(f"[+] Deleted {SIGNED_APK_OUTPUT_DIR}")
    patched_dir = os.path.join(SCRIPT_DIR, "patched")
    if os.path.exists(patched_dir):
        print(f"[*] Deleting existing directory: {patched_dir}")
        shutil.rmtree(patched_dir)
        print(f"[+] Deleted {patched_dir}")

    print("[*] Unpacking APK...")
    subprocess.run(APKTOOL_CMD + ['d', APK_FILE, '-o', DECOMPILED_DIR], check=True)
    print("[+] APK Unpacked.")


def modify_so_file(file_path, original_url, new_url):
    print(file_path)
    if os.path.exists(file_path):
        with open(file_path, 'rb+') as f:
            content = f.read()

            if original_url in content:
                content = content.replace(original_url, new_url.ljust(len(original_url), b'\x00'))

                f.seek(0)
                f.write(content)
                f.truncate()
                print(f"[+] Modified {file_path}.")
            else:
                print(f"[-] URL not found in {file_path}.")
    else:
        print(f"[-] {file_path} does not exist.")


def modify_manifest():
    print("[*] Modifying AndroidManifest.xml...")
    manifest_path = os.path.join(DECOMPILED_DIR, 'AndroidManifest.xml')

    if os.path.exists(manifest_path):
        with open(manifest_path, 'r+') as f:
            content = f.read()
            original_line = '<application android:appComponentFactory="android.support.v4.app.CoreComponentFactory" android:hardwareAccelerated="true" android:hasCode="true" android:icon="@mipmap/ic_launcher" android:label="@string/app_name" android:name="android.support.multidex.MultiDexApplication">'
            modified_line = '<application android:appComponentFactory="android.support.v4.app.CoreComponentFactory" android:debuggable="true" android:hardwareAccelerated="true" android:hasCode="true" android:icon="@mipmap/ic_launcher" android:label="@string/app_name" android:name="android.support.multidex.MultiDexApplication" android:usesCleartextTraffic="true">'

            if original_line in content:
                content = content.replace(original_line, modified_line)
                f.seek(0)
                f.write(content)
                f.truncate()
                print("[+] AndroidManifest.xml modified.")
            else:
                print("[-] Original line not found in AndroidManifest.xml.")
    else:
        print(f"[-] {manifest_path} does not exist.")


def repack_apk():
    print("[*] Repacking APK...")
    os.makedirs(os.path.dirname(APK_OUTPUT), exist_ok=True)
    subprocess.run(APKTOOL_CMD + ['b', '-o', APK_OUTPUT, DECOMPILED_DIR], check=True)
    print(f"[+] APK repacked as {APK_OUTPUT}.")


def sign_apk():
    print("[*] Signing APK...")
    subprocess.run(['java', '-jar', UBER_SIGNER_JAR, '-a', APK_OUTPUT, '-out', SIGNED_APK_OUTPUT_DIR], check=True)
    print(f"[+] APK signed and saved to {SIGNED_APK_OUTPUT_DIR}.")
    if os.path.exists(DECOMPILED_DIR):
        print(f"[*] Deleting existing directory: {DECOMPILED_DIR}")
        shutil.rmtree(DECOMPILED_DIR)
        print(f"[+] Deleted {DECOMPILED_DIR}")

    patched_dir = os.path.join(SCRIPT_DIR, "patched")
    if os.path.exists(patched_dir):
        print("[*] Deleting existing directory: patched")
        shutil.rmtree(patched_dir)
        print("[+] Deleted patched")


def main():
    print(("""\
███╗   ███╗██╗  ██╗██╗  ██╗██████╗     ██████╗  █████╗ ████████╗ ██████╗██╗  ██╗███████╗██████╗
████╗ ████║██║  ██║╚██╗██╔╝██╔══██╗    ██╔══██╗██╔══██╗╚══██╔══╝██╔════╝██║  ██║██╔════╝██╔══██╗
██╔████╔██║███████║ ╚███╔╝ ██████╔╝    ██████╔╝███████║   ██║   ██║     ███████║█████╗  ██████╔╝
██║╚██╔╝██║██╔══██║ ██╔██╗ ██╔══██╗    ██╔═══╝ ██╔══██║   ██║   ██║     ██╔══██║██╔══╝  ██╔══██╗
██║ ╚═╝ ██║██║  ██║██╔╝ ██╗██║  ██║    ██║     ██║  ██║   ██║   ╚██████╗██║  ██║███████╗██║  ██║
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝    ╚═╝     ╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
V0.0.2-linux
           """))
    check_java_installed()
    if len(NEW_URL) < len(ORIGINAL_URL):
        print(f"Your IP length is supported ({NEW_URL}) replacing ({ORIGINAL_URL}) now")
        # Step 1: Unpack APK
        unpack_apk()

        # Step 2: Modify IP in the .so files
        for so_file in SO_FILES:
            modify_so_file(DECOMPILED_DIR + so_file, ORIGINAL_URL, NEW_URL)
            modify_so_file(DECOMPILED_DIR + so_file, ORIGINAL_URL2, NEW_URL2)
            modify_so_file(DECOMPILED_DIR + so_file, ORI_HTTPS, NEW_HTTP)
            modify_so_file(DECOMPILED_DIR + so_file, ORI2_HTTPS, NEW2_HTTP)

        # Step 3: Modify AndroidManifest.xml
        modify_manifest()
        replace_notice_image()
        replace_gui_msg()
        # Step 4: Repack APK
        repack_apk()

        # Step 5: Sign the APK
        sign_apk()
        print("\n" + "=" * 50)
        print(f" IMPORTANT: YOUR APK WILL BE IN: {SIGNED_APK_OUTPUT_DIR}/ ".center(50, "*"))
        print("=" * 50 + "\n")
    else:
        print(f"Your IP length is too long and unsupported ({NEW_URL}) your ip should be shorter than ({ORIGINAL_URL})")


if __name__ == '__main__':
    main()
