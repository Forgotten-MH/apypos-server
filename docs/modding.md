Get MHXRTools - this can be found here. https://discord.com/channels/481188092636823552/494135269893865475/531509865873408000
Get MHXR Patcher - included in the repo
*Requires Java (https://www.java.com/download/ie_manual.jsp)
Get RevilToolset
>https://github.com/PredatorCZ/RevilLib/releases/tag/nightly




1. Drag a .fpk file from your server folder over MHXRTools.exe to unpack. It will generate a folder at the file location so you may want to copy it elsewhere in advance to not generate in Apypos.
 
2A. Inside the extracted .fpk is a folder full of .arc files. Move the folder into RevilToolset where you can batch unpack. If the folder has too many files it will fail so you may want to split them. Delete the .arcs after running the command to clean up as it makes a lot of separate folders with long paths to extract the contents. There are also plenty of tools to use later for conversion and modding other file types.
1. Open cmd in the file explorer and type:
revil_toolset.exe extract_arc --title mhxr --platform Android ??????
?????? = folder name of the extracted .fpk (arc_cmn in the example below)
2. Using a .tex file for example, you can drag it onto the "mft_tex_to_dds" bat file to turn it into .dds format.
 
2B. Alternatively, instead of moving the extracted .fpk folder over to RevilToolset, you can bring the individual .arc you need to MHXR-ARCExtract where it will generate a folder for you to edit in kuriimu. Move to MHXR-ARCRepack when done to repack. This method is recommended over 2A due to being simpler and quicker when you know which files to mod since you don’t need to clean up the dumps.
 
3. Bring the file back to the root folder, open cmd and type:
py.exe .\mhxr-android-patcher.py -i .\MHXR_base.apk -ip ??????

?????? = same IP as what you have in server
4. The modded files will be injected, then take the .apk from the out folder to install to BlueStacks.
X. If repacking back into .fpk, go to the FPK folder, have an output folder and open cmd. Use A for repacking into multiple parts and B back into a single file. I prefer B since it’s simpler for now on smaller files but may be annoying if large. Type:
A. python fpk_packer.1.0.py -i ?????? -o output
?????? = folder name of the extracted .fpk
B. python fpk3.py -i .\arc_cmn -o "output\GUI.00.fpk"
*Same situation, replace folder and .fpk name accordingly
**This script requires that you place the fpk folder into another folder named the same
Take the .fpk, replace it in your Apypos folder, delete and regenerate the appropriate download.list with yarn start:dev.
*All of this assumes you have basic resources like the base .apk and .fpks unpacked to know where everything is. If you don’t, below is the command for dumping the base apk
.\apktool.bat d .\MHXR_base.apk

Unpack fpks with:
MHXRTool.exe cmn

Replace cmn with whatever folder with fpks to batch unpack
 
