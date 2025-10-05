Get BlueStacks
>https://www.bluestacks.com/bluestacks-5.html
Get Docker Desktop
>https://docs.docker.com/desktop/install/windows-install/
Get Node.js
>https://nodejs.org/en



Get Apypos

1. Unzip Apypos

2. Unzip fpks into Apypos\src\public\res

3. Type cmd and ipconfig to find your IPv4 Address

4. Edit docker-compose.yml and replace it over the two IP spots

X. Optionally replace it over the two 127.0.0.1 (Not WEB_URL) in src\config.ts if not localhosting

5. Open cmd in the root folder and type:
docker-compose up -d

This should generate the database in your docker

------------------------------------------------------------------------------------------------------------------------------------------

Client

In the root folder of MHXR Patcher, open cmd and type:

py.exe .\mhxr-android-patcher.py -i .\MHXR_base.apk -ip ??????

?????? = same IP as what you have in server
Install the apk from the out folder to BlueStacks through:
System apps>Media Manager>Import From Windows

*First time booting into the game always hangs. Reboot it. Get into the habit of wiping the game’s data and cache and deleting download.lists and docker-compose up -d again when you change things like fpks. Reinstall the game with client edits.
