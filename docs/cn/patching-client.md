# Patching the game (Andriod)
## Requirements
- https://apktool.org/docs/install Get the bat script and the jar file 
- https://github.com/patrickfav/uber-apk-signer/releases/tag/v1.3.0 Get the jar file
## Unpack
```bash
.\apktool.bat d .\MHXR_base.apk
```
You should see a new folder called the name of the apk. 

## Modify IP
look in the new folder for the following files using a hex editor like 010 or imhex
.\lib\arm64-v8a\libMHS.so
.\lib\armeabi-v7a\libMHS.so 

Look for the string `https://mhxr-dispatch.s3-ap-northeast-1.amazonaws.com/` modify it with your ip and zeroing out the rest of the string. Ensure its http.

## Modify the AndriodManifest.xml 
In the root of the unpacked folder look for AndriodManifest.xml
Inside find the string
```xml
<application android:appComponentFactory="android.support.v4.app.CoreComponentFactory" android:hardwareAccelerated="true" android:hasCode="true" android:icon="@mipmap/ic_launcher" android:label="@string/app_name" android:name="android.support.multidex.MultiDexApplication">
```
Find that line
and then modify it to be
```xml
<application android:appComponentFactory="android.support.v4.app.CoreComponentFactory" android:debuggable="true" android:hardwareAccelerated="true" android:hasCode="true" android:icon="@mipmap/ic_launcher" android:label="@string/app_name" android:name="android.support.multidex.MultiDexApplication" android:usesCleartextTraffic="true">
```

## Repack
Repack the apk use the folder that was unpacked in the below command. It should produce a new apk.
```bash
.\apktool.bat b -o mhxr-patched.apk .\MHXR_base\
```
## Resign
```bash 
java -jar .\uber-apk-signer-1.3.0.jar -a ".\mhxr-patched.apk" -out ./out
```
## Install
It should be in a folder ./out/mhxr-patched.apk place this on to your andriod device and install it


# Patching the game (iOS)
1. Rebane the .ipa to .zip 
2. Unzip the IPA
3. Modify MHXR file with your ip by searching for https://mhxr-dispatch. and zeroing out the rest of the string. Ensure its http. then save the file
4. Rezip the Zip file and rename back to .ipa
5. Use sideloadly to sideload.