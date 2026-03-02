@echo off
echo ======================================================================
echo   DEPRECATED: apktool_legacy.bat is no longer needed.
echo   patcher.py calls apktool directly via: java -jar apktool_2.9.3.jar
echo.
echo   Use patcher.py instead:
echo.
echo     python patcher.py -i ^<apk^> -ip ^<server_ip:port^>
echo.
echo   See: docs/APK_PATCHING_GUIDE.md for details.
echo ======================================================================
exit /b 1
