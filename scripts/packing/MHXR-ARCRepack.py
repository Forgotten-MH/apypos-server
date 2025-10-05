import zlib
from pathlib import Path
import os
import struct
import sys
from Cryptodome.Cipher import Blowfish

fileExts = dict()

key = b"kaseoa nkaeka;eawf3"
cipher = Blowfish.new(key,Blowfish.MODE_ECB)

def writeUShort(file,val):
    file.write(struct.pack("H",val))

def writeUIntToByteArray(array,val):
    array.extend(struct.pack("I",val))

def jamcrc(string):
    return (zlib.crc32(str(string).encode()) ^ 0xffffffff) & 0x7fffffff

def padToECB(array):
    while (len(array) % Blowfish.block_size) != 0:
        array.extend([0x00])

def chunks(l, n):
    """Yield successive n-sized chunks from l."""
    for i in range(0, len(l), n):
        yield l[i:i + n]

def endianness_reversal(data):
    return b''.join(map(lambda x: x[::-1],chunks(data, 4)))

#there are problems with this approach, but it should work for now






fileExts[".acif"]=jamcrc("rAchievementInfo")
fileExts[".ams"]=jamcrc("rArmorSet")
fileExts[".ase"]=jamcrc("rSoundAttributeSe")
fileExts[".bdd"]=jamcrc("rBodyData")
fileExts[".bld"]=jamcrc("rBlockList")
fileExts[".bsmt"]=jamcrc("rBugiStrengthenNeedMaterialTable")
fileExts[".bszt"]=jamcrc("rBugiStrengthenNeedZenyTable")
fileExts[".btbl"]=jamcrc("rBlockTable")
fileExts[".cacp"]=jamcrc("rChargeAxeChargeParam")
fileExts[".ccl"]=jamcrc("rChainCol")
fileExts[".cddp"]=jamcrc("rChargeAxeDefDownParam")
fileExts[".copm"]=jamcrc("rConditionParam")
fileExts[".ctc"]=jamcrc("rCnsTinyChain")
fileExts[".ctss"]=jamcrc("rContentSclSet")
fileExts[".cui"]=jamcrc("rItemCurrency")
fileExts[".dft"]=jamcrc("rDefineTable")
fileExts[".dinf"]=jamcrc("rDramaInfo")
fileExts[".dit"]=jamcrc("rItemDisplay")
fileExts[".e2d"]=jamcrc("rEffect2D")
fileExts[".ean"]=jamcrc("rEffectAnim")
fileExts[".ebd"]=jamcrc("rEnemyBaseData")
fileExts[".ebp"]=jamcrc("rEnemyBugiParam")
fileExts[".ebrn"]=jamcrc("rEnemyBreakName")
fileExts[".ecp"]=jamcrc("rEnemyCommonParam")
fileExts[".ect"]=jamcrc("rEquipChangeColors")
fileExts[".ect"]=jamcrc("rEquipChainTable")
fileExts[".ecvt"]=jamcrc("rEquipCollectionValueTable")
fileExts[".edt"]=jamcrc("rEnemyDataTable")
fileExts[".ees"]=jamcrc("rCtcEquipSeriesEffectSet")
fileExts[".ees"]=jamcrc("rCtcEquipEffectSet")
fileExts[".efl"]=jamcrc("rEffectList")
fileExts[".efp"]=jamcrc("rEffectParam")
fileExts[".eli"]=jamcrc("rEnemyList")
fileExts[".emc"]=jamcrc("rEnemyCmd")
fileExts[".ems"]=jamcrc("rEnemyStatus")
fileExts[".enc"]=jamcrc("rExploreNoteContent")
fileExts[".ensh"]=jamcrc("rEventNodeSheet")
fileExts[".epe"]=jamcrc("rEffectParamEnemy")
fileExts[".ept"]=jamcrc("rEquipPierceTable")
fileExts[".epv"]=jamcrc("rEquipPotentialValue")
fileExts[".eqet"]=jamcrc("rEquipEffectTable")
fileExts[".eqh"]=jamcrc("rEquipHint")
fileExts[".eqpk"]=jamcrc("rEquipSkillPack")
fileExts[".eqs"]=jamcrc("rEquipSeries")
fileExts[".esaf"]=jamcrc("rEquipSkillAntiField")
fileExts[".esep"]=jamcrc("rEquipSkillEventPoint")
fileExts[".esp"]=jamcrc("rEquipSkillParam")
fileExts[".esq"]=jamcrc("rEffectSequence")
fileExts[".essa"]=jamcrc("rEquipSkillEventSuicideAttack")
fileExts[".est"]=jamcrc("rEquipSoundTable")
fileExts[".evbn"]=jamcrc("rEventBannerPath")
fileExts[".evet"]=jamcrc("rEvolutionEquipTable")
fileExts[".evhm"]=jamcrc("rEventHome")
fileExts[".fei"]=jamcrc("rFixedEquipInfo")
fileExts[".fep"]=jamcrc("rForestEnemyParam")
fileExts[".fes"]=jamcrc("rFixedEquipSet")
fileExts[".fqs"]=jamcrc("rForestQuestSheet")
fileExts[".fqsh"]=jamcrc("rForestFloorMap")
fileExts[".fsbs"]=jamcrc("rFieldSkillBlockSet")
fileExts[".fspm"]=jamcrc("rFieldSkillParam")
fileExts[".fsst"]=jamcrc("rFieldSkillSet")
fileExts[".ftts"]=jamcrc("rForestTechnicalTableSet")
fileExts[".fup"]=jamcrc("rFreeUseParam")
fileExts[".gbmd"]=jamcrc("rGuildBingoMission")
fileExts[".gfd"]=jamcrc("rGUIFont")
fileExts[".glet"]=jamcrc("rGunLanceEftTable")
fileExts[".gmd"]=jamcrc("rGUIMessage")
fileExts[".gui"]=jamcrc("rGUI")
fileExts[".hgpm"]=jamcrc("rHigiParam")
fileExts[".hgs"]=jamcrc("rHigiSet")
fileExts[".hird"]=jamcrc("rHairData")
fileExts[".hlmc"]=jamcrc("rHelmCustomData")
fileExts[".hlmcg"]=jamcrc("rHelmCustomData_4G")
fileExts[".hlmd"]=jamcrc("rHelmData")
fileExts[".hlmdg"]=jamcrc("rHelmData_4G")
fileExts[".hrh"]=jamcrc("rHunterRankHint")
fileExts[".htd"]=jamcrc("rHitData")
fileExts[".hts"]=jamcrc("rHitSize")
fileExts[".iat"]=jamcrc("rItemArtifact")
fileExts[".iaug"]=jamcrc("rItemAugite")
fileExts[".icl"]=jamcrc("rItemCollection")
fileExts[".iept"]=jamcrc("rItemEventPoint")
fileExts[".ifes"]=jamcrc("rItemForestEquipSkill")
fileExts[".ifne"]=jamcrc("rItemForestNyankenEquipSkill")
fileExts[".ifor"]=jamcrc("rItemForest")
fileExts[".ifrt"]=jamcrc("rForestRandomTable")
fileExts[".ifst"]=jamcrc("rItemForestStamina")
fileExts[".ilim"]=jamcrc("rItemLimit")
fileExts[".imas"]=jamcrc("rItemMaterialSearch")
fileExts[".imat"]=jamcrc("rItemMaterial")
fileExts[".imata"]=jamcrc("rItemMatatabi")
fileExts[".ipay"]=jamcrc("rItemPayment")
fileExts[".ipcn"]=jamcrc("rItemPcoin")
fileExts[".ipgr"]=jamcrc("rItemPartnerGrow")
fileExts[".ipmt"]=jamcrc("rItemPlusUpMaterial")
fileExts[".ipow"]=jamcrc("rItemPower")
fileExts[".itra"]=jamcrc("rItemTravel")
fileExts[".kpu"]=jamcrc("rKaridamaPowerUpTable")
fileExts[".ktmi"]=jamcrc("rKatamariInfo")
fileExts[".kwp"]=jamcrc("rKariwazaParam")
fileExts[".lcm"]=jamcrc("rCameraList")
fileExts[".lmt"]=jamcrc("rMotionList")
fileExts[".map"]=jamcrc("rMapSet")
fileExts[".mapi"]=jamcrc("rMonsterAppearInfo")
fileExts[".mdln"]=jamcrc("rModelNum")
fileExts[".mef"]=jamcrc("rMhMotionEffect")
fileExts[".mod"]=jamcrc("rModel")
fileExts[".mpd"]=jamcrc("rMapData")
fileExts[".mpm"]=jamcrc("rMonsterPartsManager")
fileExts[".mpt"]=jamcrc("rMonumentParamType")
fileExts[".mrl"]=jamcrc("rMaterial")
fileExts[".msp"]=jamcrc("rMonumentStrengthenParam")
fileExts[".mss"]=jamcrc("rMHSoundSequence")
fileExts[".mtb"]=jamcrc("rMonumentTreasureBonus")
fileExts[".nsht"]=jamcrc("rNodeSheet")
fileExts[".nyqt"]=jamcrc("rNyankenQuest")
fileExts[".obp"]=jamcrc("rOzyamaBombParam")
fileExts[".oeb"]=jamcrc("rOtomoEquipBody")
fileExts[".oebm"]=jamcrc("rOtomoEquipBodyModel")
fileExts[".oeh"]=jamcrc("rOtomoEquipHead")
fileExts[".oehm"]=jamcrc("rOtomoEquipHeadModel")
fileExts[".oew"]=jamcrc("rOtomoEquipWeapon")
fileExts[".oewm"]=jamcrc("rOtomoEquipWeaponModel")
fileExts[".ogr"]=jamcrc("rOtomoGrow")
fileExts[".oms"]=jamcrc("rOmamoriSeries")
fileExts[".opa"]=jamcrc("rOtomoParam")
fileExts[".ort"]=jamcrc("rOmamoriReleaseTable")
fileExts[".osht"]=jamcrc("rOceanSheet")
fileExts[".osmc"]=jamcrc("rOtomoSkillMainCommon")
fileExts[".osmg"]=jamcrc("rOtomoSkillMainGather")
fileExts[".osmh"]=jamcrc("rOtomoSkillMainHeal")
fileExts[".osml"]=jamcrc("rOtomoSkillMainLucky")
fileExts[".osmp"]=jamcrc("rOtomoSkillMainProvoke")
fileExts[".osmp"]=jamcrc("rOtomoSkillMainPipe")
fileExts[".osmr"]=jamcrc("rOtomoSkillMainRescue")
fileExts[".osmt"]=jamcrc("rOtomoSkillMainTrap")
fileExts[".oss"]=jamcrc("rOtomoSkillSub")
fileExts[".ott"]=jamcrc("rOmamoriTriggerTable")
fileExts[".pbdl"]=jamcrc("rParamByDangerLv")
fileExts[".pblm"]=jamcrc("rPlayerBulletParam")
fileExts[".pcp"]=jamcrc("rPlayerCmnParam")
fileExts[".pel"]=jamcrc("rProofEffectList")
fileExts[".pev"]=jamcrc("rPartnerEquipVoice")
fileExts[".pgt"]=jamcrc("rPartnerGrowTable")
fileExts[".pitm"]=jamcrc("rPlayerItemParam")
fileExts[".plcd"]=jamcrc("rPlayerConditionParam")
fileExts[".plcr"]=jamcrc("rPlayerCrystalParam")
fileExts[".plmd"]=jamcrc("rPlayerModelDefine")
fileExts[".pmp"]=jamcrc("rPipeMelodyParam")
fileExts[".pnap"]=jamcrc("rPartnerActionParam")
fileExts[".pnp"]=jamcrc("rPartnerParam")
fileExts[".psht"]=jamcrc("rPartSheet")
fileExts[".psl"]=jamcrc("rPartnerSkillList")
fileExts[".pslx"]=jamcrc("rProofEffectMotSequenceList")
fileExts[".psp"]=jamcrc("rPartnerSkillParam")
fileExts[".pts"]=jamcrc("rFestaPelTiedSe")
fileExts[".pwp"]=jamcrc("rPlayerParam")
fileExts[".qsht"]=jamcrc("rQuestSheet")
fileExts[".sbc"]=jamcrc("rCollision")
fileExts[".sbkr"]=jamcrc("rSoundBank")
fileExts[".scd"]=jamcrc("rServerConstData")
fileExts[".scsr"]=jamcrc("rSoundCurveSet")
fileExts[".sdl"]=jamcrc("rScheduler")
fileExts[".sdsr"]=jamcrc("rSoundDirectionalSet")
fileExts[".sdtl"]=jamcrc("rStageData")
fileExts[".sep"]=jamcrc("rShellEffectParam")
fileExts[".sew"]=jamcrc("rSoundSourceADPCM")
fileExts[".shell"]=jamcrc("rShell")
fileExts[".slt"]=jamcrc("rSlotInfo")
fileExts[".snmt"]=jamcrc("rStrengthenNeedMaterialTable")
fileExts[".srqr"]=jamcrc("rSoundRequest")
fileExts[".srqr"]=jamcrc("rSoundRequest")
fileExts[".sti"]=jamcrc("rStoryInfo")
fileExts[".stmp"]=jamcrc("rItemStamp")
fileExts[".stqr"]=jamcrc("rSoundStreamRequest")
fileExts[".sts"]=jamcrc("rSubTargetList")
fileExts[".sts"]=jamcrc("rSubTargetSet")
fileExts[".tex"]=jamcrc("rTexture")
fileExts[".tlif"]=jamcrc("rTitleInfo")
fileExts[".tqi"]=jamcrc("rTechnicalQuestInfo")
fileExts[".tqs"]=jamcrc("rTechnicalQuestSet")
fileExts[".trd"]=jamcrc("rTutorialRouteData")
fileExts[".vib"]=jamcrc("rVibrationParam")
fileExts[".wps"]=jamcrc("rWeaponSeries")
fileExts[".zei"]=jamcrc("rItemZeny")
fileExts[".zon"]=jamcrc("rZone")

def getExtension(hash):
    if hash in fileExts:
        return fileExts[hash]
    else:
        return int("0x"+hash.replace(".",""),16)

def exportString(array,string):
    nullsize = 64 - len(string)
    array.extend(string.encode('utf-8'))
    for i in range(nullsize):
        array.extend([0x00])

def appendArrayToOffset(array,offset):
    while len(array) < offset:
        array.extend([0x00])

class Entry:
    def __init__(self,name,extHash,compSize,decompSize,buffer):
        self.name = name
        self.extHash = extHash
        self.compSize = compSize
        self.decompSize = decompSize
        self.buffer = buffer
    
    def setOffset(self, offset):
        self.offset = offset

class LogEntry:
    def __init__(self,path,index):
        self.path = path
        self.index = index

def writeArchive(importPath,outFile):
    if not os.path.exists(importPath+"orderlog.txt"):
        print("Log file not present!")
        return 0
    logfile = open(importPath+"orderlog.txt",'r')
    logentries = []
    lineIndex = 0
    for line in logfile:
        path = line.replace("\n","")
        logentries.append(LogEntry(path,lineIndex))
        lineIndex += 1
    logfile.close()
    fileCount = len(logentries)
    outFile.write(b'ARCC') #just go ahead and write it out to the encrypted version
    writeUShort(outFile,7)
    writeUShort(outFile,fileCount)
    fileDec = bytearray()
    entries = []
    for entry in logentries:
        name = entry.path.split(".")
        namePath = name[0]
        extHash = getExtension("."+name[1])
        print(namePath)
        fullPath = importPath + "/" + entry.path
        inFile = open(fullPath,'rb')
        uBuffer = inFile.read()
        decompSize = len(uBuffer)
        buffer = zlib.compress(uBuffer)
        buffer = bytearray(buffer)
        while (len(buffer) % 8) != 0:
            buffer.extend([0x00])
        compSize = len(buffer)
        entries.insert(entry.index,Entry(namePath,extHash,compSize,decompSize,buffer))
    currentOff = (8 + (fileCount * 0x90)) + (32768- ((8 + (fileCount * 0x90)) % 32768 )) #basically, just make sure it's far from the header
    startingOff = currentOff
    for entry in entries:
        exportString(fileDec,entry.name)
        writeUIntToByteArray(fileDec,entry.extHash)
        writeUIntToByteArray(fileDec,entry.compSize)
        writeUIntToByteArray(fileDec, ((entry.decompSize) + 0x40000000))
        writeUIntToByteArray(fileDec, currentOff)
        entry.setOffset(currentOff)
        currentOff += entry.compSize
        #print(startingOff)
    appendArrayToOffset(fileDec,startingOff-8) #8 bytes already present in the file
    for entry in entries:
        fileDec.extend(entry.buffer)
    padToECB(fileDec)
    fileEnc = bytearray()
    fileEnc.extend(endianness_reversal(cipher.encrypt(endianness_reversal(fileDec))))
    outFile.write(fileEnc)
    outFile.close()



if __name__ == "__main__":
    for i, arg in enumerate(sys.argv):
        if i > 0:
            writeArchive(arg+"/",open(os.path.dirname(arg)+"/"+os.path.basename(arg)+"-new.arc",'wb'))