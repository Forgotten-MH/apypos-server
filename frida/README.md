# Prerequisites 
-  Rooted device
  
# Unpack Modified APK 
`.\apktool.bat d .\MHXR_base_1-aligned-debugSigned.apk`

if you dont have a modified apk you will need to modify it or hook it to enable the following options on the android manifest
- android:debuggable="true" 
- android:usesCleartextTraffic="true"
Example line:
```
<application android:appComponentFactory="android.support.v4.app.CoreComponentFactory" android:hardwareAccelerated="true" 
    android:hasCode="true" android:icon="@mipmap/ic_launcher" android:label="@string/app_name" android:name="android.support.multidex.MultiDexApplication" android:debuggable="true" android:usesCleartextTraffic="true">
```

# Modify IP
look in the following files using a hex editor like 010
`.\MHXR_base_1-aligned-debugSigned\lib\arm64-v8a\libMHS.so`
`.\MHXR_base_1-aligned-debugSigned\lib\armeabi-v7a\libMHS.so`

## if not modified look for 
`https://mhxr-dispatch.s3-ap-northeast-1.amazonaws.com/` and replace with your own ip
## Look for the following hex if modified:
```
00 68 74 74 70 3A 2F 2F 31 39 32 2E 31 36 38 2E
31 2E 32 30 33 2F 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
00 00 00 00 00 00 00 00
```

or text

`http://192.168.1.1/`

replace with your local ip NOT `127.0.0.1` where the server is running.  it needs to have a ending `/`

It's important that you don't remove anything only replace.

# Repack
`.\apktool.bat b -o mhxr-frida.apk .\MHXR_base_1-aligned-debugSigned\`

`java -jar .\uber-apk-signer-1.3.0.jar -a ".\mhxr-frida.apk" -out ./out`

# Install
It should be in a folder ./out/mhxr-frida.apk 
# Hiding the game from root
- Use MagiHide to Hide the root from the game if that doesnt work install the module from here `https://github.com/LSPosed/LSPosed.github.io/releases` To hide root

# Install Frida Server
Use x86_64 if you are using bluestacks
1. Push the frida server binary to the device using adb`.\adb.exe -s 127.0.0.1:5555 push .\frida-server-16.4.4-android-x86_64 /data/local/tmp/`  
2. chmod the executable `.\adb.exe -s 127.0.0.1:5555 shell "su -c chmod 755 /data/local/tmp/frida-server-16.4.4-android-x86_64"`                                          
3. Run the exacutable`.\adb.exe -s 127.0.0.1:5555 shell "su -c /data/local/tmp/frida-server-16.4.4-android-arm64 &"`
# Running Frida Loader
1. Run the `loader.py` if you are not on a emulator remove the `, realm="emulated")` from the attach
2. The game should start and in your logs you should see values from frida interceptions