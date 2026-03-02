# MHXR APK Patching Guide for Apypos Private Server

This document details every patch required to connect the Monster Hunter Explore (MHXR) v09.03.06 Android client to the Apypos private server. It serves as a reference for creating a comprehensive automated patcher.

## Overview

The MHXR client requires the following patches to connect to a private server:

| # | Patch | Target | Purpose |
|---|-------|--------|---------|
| 1 | Dispatch URL redirect | `libMHS.so` (native) | Point client to local server instead of AWS S3 |
| 2 | SafetyNet bypass - `sSafetyNet::isComplete()` | `libMHS.so` (native) | Always report SafetyNet as complete |
| 3 | SafetyNet bypass - `sSafetyNet::move()` | `libMHS.so` (native) | Skip JNI SafetyNet calls entirely |
| 4 | SafetyNet Java stub | `b.smali` (Java) | Stub out Google SafetyNet API calls |
| 5 | Google Play Services bypass | Multiple `.smali` | Prevent crashes from missing GMS |
| 6 | Cleartext HTTP traffic | `AndroidManifest.xml` + `network_security_config.xml` | Allow HTTP (not just HTTPS) |
| 7 | Debug logging (optional) | `d.smali`, `MtBuildMode.smali` | Enable MT Framework debug logs |

## Prerequisites

- **apktool** v2.9.3+ (decompile/recompile APK)
- **Android SDK build-tools** (zipalign, apksigner)
- **Python 3** (for binary patching)
- **Java/keytool** (for signing keystore)

## Tools Setup

```bash
# Create signing keystore (one-time)
keytool -genkey -v -keystore mhxr_debug.keystore -alias mhxr \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass android -keypass android \
  -dname "CN=MHXR Debug, OU=Debug, O=Debug, L=Debug, ST=Debug, C=US"
```

## Step 0: Decompile

```bash
apktool d -o mhxr_decompiled MHXR_v09.03.06.apk
```

---

## Patch 1: Dispatch URL Redirect (libMHS.so)

### Background

The client fetches its server configuration (API URL, resource URL, etc.) from a "dispatch" JSON file hosted on AWS S3. The URL is hardcoded in the native binary:

```
https://mhxr-dispatch.s3-ap-northeast-1.amazonaws.com/
```

The client appends `<version>.json` (e.g., `09.03.06.json`) and fetches the dispatch JSON via HTTPS. Since Capcom shut down the game, this S3 bucket returns 403.

### Binary Details

- **File**: `lib/arm64-v8a/libMHS.so`
- **Offset**: `0x28d00ad`
- **Original string** (54 bytes, null-terminated): `https://mhxr-dispatch.s3-ap-northeast-1.amazonaws.com/`
- **Replacement**: Your server URL, null-padded to 54 bytes

### Patch

```python
import struct

with open('lib/arm64-v8a/libMHS.so', 'rb') as f:
    data = bytearray(f.read())

old_url = b'https://mhxr-dispatch.s3-ap-northeast-1.amazonaws.com/'
new_url = b'http://YOUR_SERVER_IP:PORT/'  # Must be <= 54 bytes

assert len(new_url) <= len(old_url), "New URL too long"
new_url_padded = new_url + b'\x00' * (len(old_url) - len(new_url))

idx = data.find(old_url)
assert idx != -1, "Original URL not found"
data[idx:idx+len(old_url)] = new_url_padded

with open('lib/arm64-v8a/libMHS.so', 'wb') as f:
    f.write(data)
```

### Server Requirement

The server must serve a JSON file at `GET /<version>.json` (e.g., `/09.03.06.json`) containing:

```json
{
  "res": "http://YOUR_SERVER_IP:PORT/res",
  "api": "http://YOUR_SERVER_IP:PORT/api",
  "web": "http://YOUR_SERVER_IP:PORT/web",
  "maintenance_bucket": "http://YOUR_SERVER_IP:PORT/",
  "maintenance_env": "maintenance_env"
}
```

---

## Patch 2: SafetyNet Bypass - `sSafetyNet::isComplete()` (libMHS.so)

### Background

The title screen state machine (`aTitle::updateDeviceCheck()`) checks both:
1. `mbEnableSafetyNet` (from the server's `safety/flag/get` response)
2. `sSafetyNet::isComplete()` (whether the SafetyNet state machine reached COMPLETE)

Even when the server sends `flag: 1` (which sets `mbEnableSafetyNet = 0`), the title state machine still requires `sSafetyNet::isComplete()` to return true OR `sSafetyNet` to be in error state 300. Simply disabling SafetyNet via the server is **not sufficient**.

### How `sServer::setupWelcomeSafetyFlagGetResponse` Works

At offset `0x1946e9c` (24 bytes):
```
CBZ  x1, RET           // null check on response
LDR  x8, [x1, #0x60]  // load "flag" field value
CMP  x8, #1            // compare with 1
CSET w8, NE            // w8 = (flag != 1) ? 1 : 0
STRB w8, [x0, #0x88]  // store to sServer+0x88 (mbEnableSafetyNet)
RET
```

So `flag=1` → `mbEnableSafetyNet=0` (disabled), `flag=0` → `mbEnableSafetyNet=1` (enabled).

**Important**: The response JSON field name is `"flag"` (not `"safety_flag"`). The native `createProperty` function registers only this field name at offset `0x28bf08b` (which is a suffix of the string `"recommended_flag"` due to compiler string pooling).

### How `aTitle::updateDeviceCheck()` Blocks

At offset `0x11c32c0`, state 200:
```
LDR  W23, [sSafetyNet_ptr, #0x3c]    // sSafetyNet state
LDRB W22, [sServer_ptr, #0x88]       // mbEnableSafetyNet

// Path 1: SafetyNet errored (state 300) AND enabled → show retry UI
CMP  W23, #300
CBNZ W22, state_400

// Path 2: SafetyNet errored AND disabled → proceed (skip)
BL   sSafetyNet::isComplete()
CMP  W23, #300
CCMP W22, #0, #0, EQ
B.EQ proceed

// Path 3: SafetyNet complete (state 200) → proceed
TBNZ W0, #0, proceed

// Path 4: SafetyNet in progress (state 100) → retry
BL   sSafetyNet::isMoving()
TBNZ W0, #0, retry

// Path 5: Otherwise → stuck forever
```

Without Google Play Services, `sSafetyNet` gets stuck at state 0 or 100, and none of the exit conditions are met.

### Binary Details

- **Function**: `sSafetyNet::isComplete()`
- **Offset**: `0x1af90e4`
- **Size**: 16 bytes
- **Original instructions**:
  ```
  0x1af90e4: b9403c08  LDR  W8, [X0, #0x3c]   ; load state
  0x1af90e8: 7103211f  CMP  W8, #0xc8          ; compare with 200
  0x1af90ec: 1a9f17e0  CSET W0, EQ             ; W0 = (state == 200)
  0x1af90f0: d65f03c0  RET
  ```
- **Patched instructions**:
  ```
  0x1af90e4: 52800020  MOV  W0, #1             ; always return true
  0x1af90e8: d65f03c0  RET
  0x1af90ec: d503201f  NOP
  0x1af90f0: d503201f  NOP
  ```

### Patch

```python
import struct

with open('lib/arm64-v8a/libMHS.so', 'rb') as f:
    data = bytearray(f.read())

offset = 0x1af90e4
patch = struct.pack('<IIII', 0x52800020, 0xd65f03c0, 0xd503201f, 0xd503201f)
data[offset:offset+16] = patch

with open('lib/arm64-v8a/libMHS.so', 'wb') as f:
    f.write(data)
```

---

## Patch 3: SafetyNet Bypass - `sSafetyNet::move()` (libMHS.so)

### Background

`sSafetyNet::move()` is the background state machine that runs every frame:
- **State 0**: Calls `native::safetynet::sendSafetyNetRequest()` via JNI → Java
- **State 100**: Polls `native::safetynet::getState()`, waiting for result == 3
- **State 200**: Complete (success)
- **State 300**: Error

Without this patch, `move()` calls JNI `sendSafetyNetRequest()` which may crash or hang in environments without Google Play Services.

### Binary Details

- **Function**: `sSafetyNet::move()`
- **Offset**: `0x1af9064`
- **Size**: 96 bytes (0x60)
- **State field**: `[this + 0x3C]`
- **Patch target**: bytes at `0x1af9074` (after prologue)

The function prologue (kept intact):
```
0x1af9064: f81e0ff3  STP  X19, XZR, [SP, #-16]!  ; save X19
0x1af9068: a9017bfd  STP  FP, LR, [SP, #16]       ; save frame
0x1af906c: 910043fd  ADD  FP, SP, #16             ; frame pointer
0x1af9070: aa0003f3  MOV  X19, X0                 ; save this pointer
```

Patch at `0x1af9074` (3 instructions, replacing original state check):
```
0x1af9074: 52801908  MOV  W8, #0xC8              ; 200 = COMPLETE state
0x1af9078: b9003e68  STR  W8, [X19, #0x3C]       ; store state = 200
0x1af907c: 1400000f  B    0x1af90b8              ; jump to epilogue
```

The epilogue at `0x1af90b8` (kept intact):
```
0x1af90b8: a9417bfd  LDP  FP, LR, [SP, #16]
0x1af90bc: f84207f3  LDP  X19, XZR, [SP], #16
0x1af90c0: d65f03c0  RET
```

### Patch

```python
import struct

with open('lib/arm64-v8a/libMHS.so', 'rb') as f:
    data = bytearray(f.read())

# Patch at 0x1af9074: MOV W8, #200; STR W8, [X19, #0x3C]; B epilogue
offset = 0x1af9074
data[offset:offset+4]   = struct.pack('<I', 0x52801908)  # MOV W8, #0xC8
data[offset+4:offset+8] = struct.pack('<I', 0xb9003e68)  # STR W8, [X19, #0x3C]
data[offset+8:offset+12] = struct.pack('<I', 0x1400000f) # B +15 instructions

with open('lib/arm64-v8a/libMHS.so', 'wb') as f:
    f.write(data)
```

---

## Patch 4: SafetyNet Java Stub (b.smali)

### Background

The Java class `b` (in `jp.co.capcom.android.explore`) wraps the Google SafetyNet Attestation API. The native code calls `MTFPActivity.sendSafetyNetRequest()` which creates a `b` instance and calls `b.a(Context, b$a callback)`.

With Patches 2+3 applied, this Java code path is never reached. However, patching it provides defense-in-depth in case some other code path triggers SafetyNet.

### File

`smali/jp/co/capcom/android/explore/b.smali`

### Method to Patch

`a(Landroid/content/Context;Ljp/co/capcom/android/explore/b$a;)I`

Replace the method body to:
1. Set result string `g = ""` (empty)
2. Set status code `h = 0`
3. Store callback in field `e`
4. Set internal state `d = 1` (in-progress)
5. Invoke `callback.a(0)` immediately
6. Set internal state `d = 2` (complete)
7. Return `0`

```smali
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
.end method
```

### Callback Chain (for reference)

```
b.a(context, callback) → callback.a(0)
  → MTFPActivity$13.a(0)
    → MTFPActivity.b(0)  [safetyNetCallbackEvent]
      → new MTFPEvent("MTFPSafetyNetEvent", param=0)
      → MTFPJNI.notifyEvent(event)  [JNI to native]
        → native::android::notifyEvent()  [event dispatch]
          → [MTFPSafetyNetEvent handler]
            → JNI: getSafetyNetResult()  → returns ""
            → JNI: getSafetyNetStatusCode()  → returns 0
            → Writes native::safetynet::State = 3 (COMPLETE)
```

---

## Patch 5: Google Play Services Bypass (smali)

### Background

The MHXR client references Google Play Services (GMS), Firebase Cloud Messaging (FCM), and Google Play Games. These cause crashes or hangs in environments without GMS (e.g., Waydroid, most emulators).

### 5a: GameHelper (`smali/com/google/example/games/basegameutils/GameHelper.smali`)

In `onActivityResult()`, comment out or bypass the `GooglePlayServicesUtil.isGooglePlayServicesAvailable()` check. The simplest approach: make `onActivityResult` return immediately.

### 5b: Firebase/GCM Registration

In `MTFPActivity.smali`, the FCM/GCM registration (`sendRegistrationIdToBackend`, `getRegistrationId`) should be stubbed to return empty strings or no-ops.

### 5c: Google Play Games Sign-In

Any calls to `Games.Players`, `GoogleSignInClient`, etc. should be wrapped in try-catch or stubbed.

**Note**: The exact smali patches depend on which GMS features the client uses. The critical ones are SafetyNet (Patch 4) and GameHelper. The rest can be handled case-by-case based on logcat crash output.

---

## Patch 6: Allow Cleartext HTTP Traffic (AndroidManifest.xml)

### Background

Android 9+ (API 28+) blocks cleartext HTTP by default. The original client used HTTPS for the dispatch URL (S3). With the dispatch URL patched to HTTP, the OS-level Network Security Configuration blocks the request with:

```
Cleartext HTTP traffic to <IP> not permitted
```

### Patch

**File**: `AndroidManifest.xml`

Add `android:usesCleartextTraffic="true"` and `android:networkSecurityConfig="@xml/network_security_config"` to the `<application>` tag:

```xml
<application
    android:usesCleartextTraffic="true"
    android:networkSecurityConfig="@xml/network_security_config"
    ... >
```

**File**: `res/xml/network_security_config.xml` (create new)

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

---

## Patch 7: Debug Logging (Optional)

### 7a: MT Framework Log Output (`d.smali`)

**File**: `smali/jp/co/capcom/android/explore/d.smali`

Remove all `MtBuildMode` checks so logs always output to Android logcat. This helps with debugging the client's state machine.

### 7b: Build Mode (`MtBuildMode.smali`)

**File**: `smali/jp/co/capcom/android/explore/MtBuildMode.smali`

Set `a = true` (develop mode), `b = false` (not master). Note: the native code may override these at runtime.

---

## Rebuild, Sign, Install

```bash
# Rebuild
apktool b -o mhxr_patched.apk mhxr_decompiled/

# Zipalign
zipalign -f 4 mhxr_patched.apk mhxr_aligned.apk

# Sign
apksigner sign \
  --ks mhxr_debug.keystore \
  --ks-pass pass:android \
  --key-pass pass:android \
  --out mhxr_signed.apk \
  mhxr_aligned.apk

# Install (Waydroid example)
waydroid app install mhxr_signed.apk
# Or via pm install:
cp mhxr_signed.apk /shared/folder/
waydroid shell -- pm install /data/waydroid_tmp/mhxr_signed.apk
```

**Important**: If upgrading an existing install with a different signing key, you must uninstall first:
```bash
waydroid shell -- pm uninstall jp.co.capcom.android.explore
```

---

## Server Requirements Summary

For the client to progress through the full startup sequence, the server must handle:

### Startup Sequence (in order)

| # | Method | Endpoint | Notes |
|---|--------|----------|-------|
| 1 | GET | `/<version>.json` | Dispatch — returns API/res/web URLs |
| 2 | GET | `/maintenance_env/schedule` | Maintenance schedule |
| 3 | POST | `/api/maintenance/check` | Maintenance status |
| 4 | POST | `/api/banner/dllist/get` | Banner download list (can return empty `download_list: []`) |
| 5 | POST | `/api/maintenance/titleimage/get` | Title image config |
| 6 | POST | `/api/welcome/safety/flag/get` | **Must return `{ "flag": 1 }` to disable SafetyNet** |
| 7 | POST | `/api/account/regist` | New account registration |
| 7a | POST | `/api/account/login` | Returning player login |
| 8 | POST | `/api/check/nothing` | Heartbeat/version check |
| 9 | GET | `/res/download/android/openingDL/download.list` | Opening resource list (can be empty) |
| 10 | GET | `/res/download/android/v0282/stdDL/download.list` | Standard resource list (can be empty) |
| 11 | POST | `/api/quest/progress` | Quest progress data |
| 12 | POST | `/api/quest/forest/progress` | Forest quest progress |
| 13 | POST | `/api/dictionary/equipment/get` | Equipment dictionary |
| 14 | POST | `/api/tutorial/flag/get` | Tutorial completion flags |

### Key Server Response Notes

- All API responses are Blowfish ECB encrypted (`application/octet-stream`)
- Response envelope must include: `error_code`, `session_id`, `app_ver`, `res_ver` (282), `banner_ver` (91), `now_time`, `one_day_time`, `relogin_time`
- `banner/dllist/get`: Must return a valid encrypted response even when no banner files exist (return `{ download_list: [] }`)
- `openingDL/download.list` and `stdDL/download.list`: Plain text files served statically. Can be empty if no FPK resource files are available.

---

## Key Native Symbols Reference

| Symbol | Address | Purpose |
|--------|---------|---------|
| Dispatch URL string | `0x28d00ad` | Server configuration URL |
| `sServer::setupWelcomeSafetyFlagGetResponse` | `0x1946e9c` | Processes `flag` field → `mbEnableSafetyNet` |
| `aTitle::updateDeviceCheck` | `0x11c32c0` | Title state machine (checks SafetyNet) |
| `sSafetyNet::move` | `0x1af9064` | SafetyNet background state machine |
| `sSafetyNet::isComplete` | `0x1af90e4` | Returns `state == 200` |
| `sSafetyNet::isMoving` | `0x1af90f4` | Returns `state == 100` |
| `sSafetyNet::request` | `0x1af90c4` | Triggers SafetyNet request |
| `sSafetyNet::mpInstance` | `0x3444560` | Singleton BSS address |
| `sServer::mpInstance` | `0x343fff0` | Singleton BSS address |
| `native::safetynet::sendSafetyNetRequest` | `0x280ced8` | JNI call to Java |
| `native::safetynet::getState` | `0x280cf4c` | Reads State global |
| `native::safetynet::getStatusCode` | `0x280cf5c` | Reads StatusCode global |
| `native::safetynet::getResult` | `0x280cf6c` | Reads result string |
| `native::safetynet::initialize` | `0x280ce28` | Registers event handler |
| `native::safetynet::State` | `0x356ee78` | Global state variable |
| `cAPIWelcomeSafetyFlagGet::Response::createProperty` | `0x17448c0` | Registers "flag" JSON field |

---

## Troubleshooting

### Error Code 3 (Network Error)

- **Cleartext HTTP blocked**: Check logcat for `Cleartext HTTP traffic to <IP> not permitted`. Apply Patch 6.
- **Banner dllist returning 500**: The banner controller throws when the banner directory doesn't exist. Server fix: return empty `download_list: []` on error instead of HTTP 500.
- **download.list 404**: Create empty `download.list` files in `src/public/res/download/android/openingDL/` and `src/public/res/download/android/v0282/stdDL/`.

### Error Code 4

- **Wrong dispatch URL**: The dispatch JSON is missing the port number. Check that the API URL includes the port (e.g., `http://IP:8080/api`, not `http://IP/api`).

### Error Code 400

- **Blowfish padding not stripped**: The server must strip null bytes from decrypted request bodies: `decryptedData.replace(/\0+$/, '').trim()` before JSON parsing.

### Error Code 403

- **Dispatch URL still pointing to AWS**: The native binary patch didn't take effect. Verify the installed APK has the patched `libMHS.so`. If upgrading over an existing install, the old APK may be cached — uninstall first.
- **Android cleartext policy**: Same as Error Code 3.

### Client stuck at "通信中です…" (Communicating...)

- **SafetyNet state machine stuck**: Patches 2+3 not applied or not in the installed binary. Verify with:
  ```python
  # Check isComplete patch
  data = open('libMHS.so', 'rb').read()
  assert struct.unpack_from('<I', data, 0x1af90e4)[0] == 0x52800020
  # Check move patch
  assert struct.unpack_from('<I', data, 0x1af9074)[0] == 0x52801908
  ```

### "更新ファイル確認中" (Checking for update files) then Network Error

- The `banner/dllist/get` endpoint is failing. Check server logs for errors in the banner controller.

---

## Version History

- **2026-03-01**: Initial document. Patches verified against MHXR v09.03.06 (arm64-v8a) running on Waydroid (Android 13) with Apypos server v0.0.12.
