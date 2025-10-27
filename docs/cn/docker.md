# 获取相关软件

获取 Docker Desktop（Docker 桌面版）
>https://www.bluestacks.com/bluestacks-5.html
Get Docker Desktop
>https://docs.docker.com/desktop/install/windows-install/
Get Node.js
>https://nodejs.org/en



# 获取 Apypos（相关程序）
1. 解压 Apypos 压缩包
2. 将 fpks 文件解压到 Apypos\src\public\res 目录下
3. 打开命令提示符（cmd），输入 ipconfig 命令查找你的 IPv4 地址
4. 编辑 docker-compose.yml 文件，将找到的 IPv4 地址替换掉文件中的两个 IP 位置
5. （可选操作）若不使用本地主机（localhost），需在 src\config.ts 文件中，将两个 127.0.0.1（非 WEB_URL 对应的 127.0.0.1）也替换为上述 IPv4 地址
6. 在 Apypos 的根目录下打开命令提示符（cmd），输入以下命令：
docker-compose up -d


执行此命令后，Docker 中会自动创建对应的数据库


------------------------------------------------------------------------------------------------------------------------------------------

# 客户端操作步骤

在 MHXR Patcher（MHXR 补丁工具）的根目录下，打开命令提示符（cmd），输入以下命令：

py.exe .\mhxr-android-patcher.py -i .\MHXR_base.apk -ip ??????

其中，?????? 需替换为与服务器端配置相同的 IP 地址

通过以下步骤将 out 文件夹中的 APK 文件安装到 BlueStacks（蓝叠模拟器）中：打开模拟器中的 “系统应用”>“媒体管理器”>“从 Windows 导入”

* 首次启动游戏时，程序通常会出现卡顿问题，重启游戏即可解决。养成以下操作习惯：当你修改 fpks 等文件后，需清除游戏数据和缓存、删除 download.lists 文件，然后重新执行 docker-compose up -d 命令，最后结合客户端修改重新安装游戏。
