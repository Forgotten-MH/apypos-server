获取 MHXRTools（MHXR 工具）—— 可在此处获取：https://discord.com/channels/481188092636823552/494135269893865475/531509865873408000

获取 MHXR Patcher（MHXR 补丁工具）—— 已包含在代码仓库中
* 此工具需 Java 环境支持（Java 下载地址：https://www.java.com/download/ie_manual.jsp）

获取 RevilToolset（Revil 工具集）
https://github.com/PredatorCZ/RevilLib/releases/tag/nightly


操作步骤

1. 从服务器文件夹中拖拽一个.fpk 文件到 MHXRTools.exe 上进行解压。程序会在该文件所在位置生成一个文件夹，因此建议提前将.fpk 文件复制到其他位置，避免在 Apypos 目录下生成多余文件。
 
2A. 解压后的.fpk 文件内会有一个包含大量.arc 文件的文件夹。将该文件夹移动到 RevilToolset 中，以便进行批量解压。若文件夹内文件数量过多，可能会导致解压失败，此时需将文件拆分后再操作。执行解压命令后，删除所有.arc 文件以清理目录 —— 因为解压过程会生成许多路径较长的独立文件夹，若不清理会占用过多空间。此外，RevilToolset 中还包含多种工具，可用于后续的文件格式转换和模组制作。
1. 在文件资源管理器中打开命令提示符（cmd），输入以下命令：
revil_toolset.exe extract_arc --title mhxr --platform Android ??????
其中，?????? 需替换为.fpk 解压后生成的文件夹名称（示例中为 arc_cmn）。
2. 以.tex 文件为例，可将其拖拽到 “mft_tex_to_dds.bat” 文件上，将其转换为.dds 格式。
 
2B. 作为 2A 步骤的替代方案：无需将.fpk 解压后的文件夹移动到 RevilToolset，而是将需要修改的单个.arc 文件导入 MHXR-ARCExtract（工具），程序会生成一个文件夹，供你在 kuriimu（另一个编辑工具）中进行编辑。编辑完成后，将文件导入 MHXR-ARCRepack（工具）重新打包即可。若你明确知道需要修改哪些文件，建议优先选择此方法 —— 该方法更简单快捷，且无需清理解压生成的冗余文件。
 
3. 将修改后的文件放回根目录，打开命令提示符（cmd），输入以下命令：py.exe .\mhxr-android-patcher.py -i .\MHXR_base.apk -ip ??????其中，?????? 需替换为与服务器端配置相同的 IP 地址。


4. 程序会自动将修改后的文件注入 APK，之后从 out 文件夹中找到生成的 APK 文件，安装到 BlueStacks（蓝叠模拟器）中即可。
5. 若需将文件重新打包为.fpk 格式，操作如下：进入 FPK 文件夹，先创建一个输出文件夹（output），然后打开命令提示符（cmd）。可选择以下两种打包方式：方式 A 将文件拆分为多个部分打包，方式 B 将文件打包为单个文件。对于较小的文件，建议优先选择方式 B（操作更简单）；若文件较大，方式 B 可能会因处理时间过长而不便。

方式 A：python fpk_packer.1.0.py -i ?????? -o output
其中，?????? 需替换为.fpk 解压后生成的文件夹名称。

方式 B：python fpk3.py -i .\arc_cmn -o "output\GUI.00.fpk"
* 两种方式均需根据实际情况，替换文件夹名称和.fpk 文件名。
* 使用此脚本前，需将 FPK 文件夹放入另一个同名文件夹中（例如，将 “arc_cmn” 文件夹放入另一个名为 “arc_cmn” 的文件夹内）。

将重新打包后的.fpk 文件替换到 Apypos 目录中，删除原有的 download.list 文件，然后执行 yarn start:dev 命令重新生成对应的 download.list 文件。

* 以上所有操作均默认你已具备基础资源（如基础 APK 文件 MHXR_base.apk、已解压的.fpk 文件），且清楚各类文件的存放位置。若你尚未获取这些基础资源，可使用以下命令解压基础 APK：
.\apktool.bat d .\MHXR_base.apk

使用以下命令批量解压 fpks 文件：MHXRTool.exe cmn（将命令中的 “cmn” 替换为包含 fpks 文件的目标文件夹名称即可）
 
