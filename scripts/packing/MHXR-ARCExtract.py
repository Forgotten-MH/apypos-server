import zlib
import os
import struct
import sys
from Cryptodome.Cipher import Blowfish

fileExts = dict()

key = b"kaseoa nkaeka;eawf3"
cipher = Blowfish.new(key,Blowfish.MODE_ECB)

def chunks(l, n):
    """Yield successive n-sized chunks from l."""
    for i in range(0, len(l), n):
        yield l[i:i + n]

def endianness_reversal(data):
    return b''.join(map(lambda x: x[::-1],chunks(data, 4)))

def readUShort(file):
    return struct.unpack("H",file.read(2))[0]

def writeUShort(file,val):
    file.write(struct.pack("H",val))

def readUInt(file):
    return struct.unpack("I",file.read(4))[0]

def jamcrc(string):
    return (zlib.crc32(str(string).encode()) ^ 0xffffffff) & 0x7fffffff

def removeNulls(array):
    arr = bytearray()
    for i in range(len(array)):
        if array[i] != 0x00:
            arr.append(array[i])
    return bytes(arr)

#this is why this needs a non-Python solution

fileExts[jamcrc("rAchievementInfo")] = ".acif"
fileExts[jamcrc("rArmorSet")] = ".ams"
fileExts[jamcrc("rSoundAttributeSe")] = ".ase"
fileExts[jamcrc("rBodyData")] = ".bdd"
fileExts[jamcrc("rBlockList")] = ".bld"
fileExts[jamcrc("rBugiStrengthenNeedMaterialTable")] = ".bsmt"
fileExts[jamcrc("rBugiStrengthenNeedZenyTable")] = ".bszt"
fileExts[jamcrc("rBlockTable")] = ".btbl"
fileExts[jamcrc("rChargeAxeChargeParam")] = ".cacp"
fileExts[jamcrc("rChainCol")] = ".ccl"
fileExts[jamcrc("rChargeAxeDefDownParam")] = ".cddp"
fileExts[jamcrc("rConditionParam")] = ".copm"
fileExts[jamcrc("rCnsTinyChain")] = ".ctc"
fileExts[jamcrc("rContentSclSet")] = ".ctss"
fileExts[jamcrc("rItemCurrency")] = ".cui"
fileExts[jamcrc("rDefineTable")] = ".dft"
fileExts[jamcrc("rDramaInfo")] = ".dinf"
fileExts[jamcrc("rItemDisplay")] = ".dit"
fileExts[jamcrc("rEffect2D")] = ".e2d"
fileExts[jamcrc("rEffectAnim")] = ".ean"
fileExts[jamcrc("rEnemyBaseData")] = ".ebd"
fileExts[jamcrc("rEnemyBugiParam")] = ".ebp"
fileExts[jamcrc("rEnemyBreakName")] = ".ebrn"
fileExts[jamcrc("rEnemyCommonParam")] = ".ecp"
fileExts[jamcrc("rEquipChangeColors")] = ".ect"
fileExts[jamcrc("rEquipChainTable")] = ".ect"
fileExts[jamcrc("rEquipCollectionValueTable")] = ".ecvt"
fileExts[jamcrc("rEnemyDataTable")] = ".edt"
fileExts[jamcrc("rCtcEquipSeriesEffectSet")] = ".ees"
fileExts[jamcrc("rCtcEquipEffectSet")] = ".ees"
fileExts[jamcrc("rEffectList")] = ".efl"
fileExts[jamcrc("rEffectParam")] = ".efp"
fileExts[jamcrc("rEnemyList")] = ".eli"
fileExts[jamcrc("rEnemyCmd")] = ".emc"
fileExts[jamcrc("rEnemyStatus")] = ".ems"
fileExts[jamcrc("rExploreNoteContent")] = ".enc"
fileExts[jamcrc("rEventNodeSheet")] = ".ensh"
fileExts[jamcrc("rEffectParamEnemy")] = ".epe"
fileExts[jamcrc("rEquipPierceTable")] = ".ept"
fileExts[jamcrc("rEquipPotentialValue")] = ".epv"
fileExts[jamcrc("rEquipEffectTable")] = ".eqet"
fileExts[jamcrc("rEquipHint")] = ".eqh"
fileExts[jamcrc("rEquipSkillPack")] = ".eqpk"
fileExts[jamcrc("rEquipSeries")] = ".eqs"
fileExts[jamcrc("rEquipSkillAntiField")] = ".esaf"
fileExts[jamcrc("rEquipSkillEventPoint")] = ".esep"
fileExts[jamcrc("rEquipSkillParam")] = ".esp"
fileExts[jamcrc("rEffectSequence")] = ".esq"
fileExts[jamcrc("rEquipSkillEventSuicideAttack")] = ".essa"
fileExts[jamcrc("rEquipSoundTable")] = ".est"
fileExts[jamcrc("rEventBannerPath")] = ".evbn"
fileExts[jamcrc("rEvolutionEquipTable")] = ".evet"
fileExts[jamcrc("rEventHome")] = ".evhm"
fileExts[jamcrc("rFixedEquipInfo")] = ".fei"
fileExts[jamcrc("rForestEnemyParam")] = ".fep"
fileExts[jamcrc("rFixedEquipSet")] = ".fes"
fileExts[jamcrc("rForestQuestSheet")] = ".fqs"
fileExts[jamcrc("rForestFloorMap")] = ".fqsh"
fileExts[jamcrc("rFieldSkillBlockSet")] = ".fsbs"
fileExts[jamcrc("rFieldSkillParam")] = ".fspm"
fileExts[jamcrc("rFieldSkillSet")] = ".fsst"
fileExts[jamcrc("rForestTechnicalTableSet")] = ".ftts"
fileExts[jamcrc("rFreeUseParam")] = ".fup"
fileExts[jamcrc("rGuildBingoMission")] = ".gbmd"
fileExts[jamcrc("rGUIFont")] = ".gfd"
fileExts[jamcrc("rGunLanceEftTable")] = ".glet"
fileExts[jamcrc("rGUIMessage")] = ".gmd"
fileExts[jamcrc("rGUI")] = ".gui"
fileExts[jamcrc("rHigiParam")] = ".hgpm"
fileExts[jamcrc("rHigiSet")] = ".hgs"
fileExts[jamcrc("rHairData")] = ".hird"
fileExts[jamcrc("rHelmCustomData")] = ".hlmc"
fileExts[jamcrc("rHelmCustomData_4G")] = ".hlmcg"
fileExts[jamcrc("rHelmData")] = ".hlmd"
fileExts[jamcrc("rHelmData_4G")] = ".hlmdg"
fileExts[jamcrc("rHunterRankHint")] = ".hrh"
fileExts[jamcrc("rHitData")] = ".htd"
fileExts[jamcrc("rHitSize")] = ".hts"
fileExts[jamcrc("rItemArtifact")] = ".iat"
fileExts[jamcrc("rItemAugite")] = ".iaug"
fileExts[jamcrc("rItemCollection")] = ".icl"
fileExts[jamcrc("rItemEventPoint")] = ".iept"
fileExts[jamcrc("rItemForestEquipSkill")] = ".ifes"
fileExts[jamcrc("rItemForestNyankenEquipSkill")] = ".ifne"
fileExts[jamcrc("rItemForest")] = ".ifor"
fileExts[jamcrc("rForestRandomTable")] = ".ifrt"
fileExts[jamcrc("rItemForestStamina")] = ".ifst"
fileExts[jamcrc("rItemLimit")] = ".ilim"
fileExts[jamcrc("rItemMaterialSearch")] = ".imas"
fileExts[jamcrc("rItemMaterial")] = ".imat"
fileExts[jamcrc("rItemMatatabi")] = ".imata"
fileExts[jamcrc("rItemPayment")] = ".ipay"
fileExts[jamcrc("rItemPcoin")] = ".ipcn"
fileExts[jamcrc("rItemPartnerGrow")] = ".ipgr"
fileExts[jamcrc("rItemPlusUpMaterial")] = ".ipmt"
fileExts[jamcrc("rItemPower")] = ".ipow"
fileExts[jamcrc("rItemTravel")] = ".itra"
fileExts[jamcrc("rKaridamaPowerUpTable")] = ".kpu"
fileExts[jamcrc("rKatamariInfo")] = ".ktmi"
fileExts[jamcrc("rKariwazaParam")] = ".kwp"
fileExts[jamcrc("rCameraList")] = ".lcm"
fileExts[jamcrc("rMotionList")] = ".lmt"
fileExts[jamcrc("rMapSet")] = ".map"
fileExts[jamcrc("rMonsterAppearInfo")] = ".mapi"
fileExts[jamcrc("rModelNum")] = ".mdln"
fileExts[jamcrc("rMhMotionEffect")] = ".mef"
fileExts[jamcrc("rModel")] = ".mod"
fileExts[jamcrc("rMapData")] = ".mpd"
fileExts[jamcrc("rMonsterPartsManager")] = ".mpm"
fileExts[jamcrc("rMonumentParamType")] = ".mpt"
fileExts[jamcrc("rMaterial")] = ".mrl"
fileExts[jamcrc("rMonumentStrengthenParam")] = ".msp"
fileExts[jamcrc("rMHSoundSequence")] = ".mss"
fileExts[jamcrc("rMonumentTreasureBonus")] = ".mtb"
fileExts[jamcrc("rNodeSheet")] = ".nsht"
fileExts[jamcrc("rNyankenQuest")] = ".nyqt"
fileExts[jamcrc("rOzyamaBombParam")] = ".obp"
fileExts[jamcrc("rOtomoEquipBody")] = ".oeb"
fileExts[jamcrc("rOtomoEquipBodyModel")] = ".oebm"
fileExts[jamcrc("rOtomoEquipHead")] = ".oeh"
fileExts[jamcrc("rOtomoEquipHeadModel")] = ".oehm"
fileExts[jamcrc("rOtomoEquipWeapon")] = ".oew"
fileExts[jamcrc("rOtomoEquipWeaponModel")] = ".oewm"
fileExts[jamcrc("rOtomoGrow")] = ".ogr"
fileExts[jamcrc("rOmamoriSeries")] = ".oms"
fileExts[jamcrc("rOtomoParam")] = ".opa"
fileExts[jamcrc("rOmamoriReleaseTable")] = ".ort"
fileExts[jamcrc("rOceanSheet")] = ".osht"
fileExts[jamcrc("rOtomoSkillMainCommon")] = ".osmc"
fileExts[jamcrc("rOtomoSkillMainGather")] = ".osmg"
fileExts[jamcrc("rOtomoSkillMainHeal")] = ".osmh"
fileExts[jamcrc("rOtomoSkillMainLucky")] = ".osml"
fileExts[jamcrc("rOtomoSkillMainProvoke")] = ".osmp"
fileExts[jamcrc("rOtomoSkillMainPipe")] = ".osmp"
fileExts[jamcrc("rOtomoSkillMainRescue")] = ".osmr"
fileExts[jamcrc("rOtomoSkillMainTrap")] = ".osmt"
fileExts[jamcrc("rOtomoSkillSub")] = ".oss"
fileExts[jamcrc("rOmamoriTriggerTable")] = ".ott"
fileExts[jamcrc("rParamByDangerLv")] = ".pbdl"
fileExts[jamcrc("rPlayerBulletParam")] = ".pblm"
fileExts[jamcrc("rPlayerCmnParam")] = ".pcp"
fileExts[jamcrc("rProofEffectList")] = ".pel"
fileExts[jamcrc("rPartnerEquipVoice")] = ".pev"
fileExts[jamcrc("rPartnerGrowTable")] = ".pgt"
fileExts[jamcrc("rPlayerItemParam")] = ".pitm"
fileExts[jamcrc("rPlayerConditionParam")] = ".plcd"
fileExts[jamcrc("rPlayerCrystalParam")] = ".plcr"
fileExts[jamcrc("rPlayerModelDefine")] = ".plmd"
fileExts[jamcrc("rPipeMelodyParam")] = ".pmp"
fileExts[jamcrc("rPartnerActionParam")] = ".pnap"
fileExts[jamcrc("rPartnerParam")] = ".pnp"
fileExts[jamcrc("rPartSheet")] = ".psht"
fileExts[jamcrc("rPartnerSkillList")] = ".psl"
fileExts[jamcrc("rProofEffectMotSequenceList")] = ".pslx"
fileExts[jamcrc("rPartnerSkillParam")] = ".psp"
fileExts[jamcrc("rFestaPelTiedSe")] = ".pts"
fileExts[jamcrc("rPlayerParam")] = ".pwp"
fileExts[jamcrc("rQuestSheet")] = ".qsht"
fileExts[jamcrc("rCollision")] = ".sbc"
fileExts[jamcrc("rSoundBank")] = ".sbkr"
fileExts[jamcrc("rServerConstData")] = ".scd"
fileExts[jamcrc("rSoundCurveSet")] = ".scsr"
fileExts[jamcrc("rScheduler")] = ".sdl"
fileExts[jamcrc("rSoundDirectionalSet")] = ".sdsr"
fileExts[jamcrc("rStageData")] = ".sdtl"
fileExts[jamcrc("rShellEffectParam")] = ".sep"
fileExts[jamcrc("rSoundSourceADPCM")] = ".sew"
fileExts[jamcrc("rShell")] = ".shell"
fileExts[jamcrc("rSlotInfo")] = ".slt"
fileExts[jamcrc("rStrengthenNeedMaterialTable")] = ".snmt"
fileExts[jamcrc("rSoundRequest")] = ".srqr"
fileExts[jamcrc("rSoundRequest")] = ".srqr"
fileExts[jamcrc("rStoryInfo")] = ".sti"
fileExts[jamcrc("rItemStamp")] = ".stmp"
fileExts[jamcrc("rSoundStreamRequest")] = ".stqr"
fileExts[jamcrc("rSubTargetList")] = ".sts"
fileExts[jamcrc("rSubTargetSet")] = ".sts"
fileExts[jamcrc("rTexture")] = ".tex"
fileExts[jamcrc("rTitleInfo")] = ".tlif"
fileExts[jamcrc("rTechnicalQuestInfo")] = ".tqi"
fileExts[jamcrc("rTechnicalQuestSet")] = ".tqs"
fileExts[jamcrc("rTutorialRouteData")] = ".trd"
fileExts[jamcrc("rVibrationParam")] = ".vib"
fileExts[jamcrc("rWeaponSeries")] = ".wps"
fileExts[jamcrc("rItemZeny")] = ".zei"
fileExts[jamcrc("rZone")] = ".zon"


def getExtension(hash):
    if hash in fileExts:
        return fileExts[hash]
    else:
        return "." + str(hex(hash)[2:])

class Entry:
    def __init__(self,name,extHash,compSize,decompSize,offset):
        self.name = name
        self.extHash = extHash
        self.compSize = compSize
        self.decompSize = decompSize
        self.offset = offset

def extractARC(inFile,fileCount):
    basePath = inFile.name.split('.')[0]+'/'
    os.makedirs(basePath,exist_ok=True)
    logFile = open(basePath+"orderlog.txt",'w')
    entries = []
    for _ in range(fileCount):
        nameArray = inFile.read(64)
        nameArray = removeNulls(nameArray)
        eName = nameArray.decode("utf-8")
        eExt = readUInt(inFile)
        eComp = readUInt(inFile)
        eUncomp = readUInt(inFile)
        eOffset = readUInt(inFile)
        entries.append(Entry(eName,eExt,eComp,eUncomp,eOffset))
    for entry in entries:
        #deal with compression first
        inFile.seek(entry.offset)
        cFile = inFile.read(entry.compSize)
        dFile = zlib.decompress(cFile)
        #create name
        dirPath = os.path.split(entry.name)[0]
        #print(dirPath, 1)
        if(dirPath != ''):
            os.makedirs(basePath+dirPath,exist_ok=True)
        logFile.write(entry.name+getExtension(entry.extHash)+"\n")
        finalName = basePath + entry.name + getExtension(entry.extHash)
        oFile = open(finalName,'wb')
        oFile.write(dFile)
        oFile.close()

def readARCC(inFile,fileCount):
    encFile = inFile.read()
    decFile = endianness_reversal(cipher.decrypt(endianness_reversal(encFile)))
    outFile = open(inFile.name+"-decrypt.arc",'wb')
    outFile.write(b"ARC\x00")
    writeUShort(outFile,7)
    writeUShort(outFile,fileCount)
    outFile.write(decFile)
    decName = outFile.name
    outFile.close()
    nFile = open(decName,'rb')
    nFile.seek(8)
    extractARC(nFile,fileCount)

def readARC(inFile):
    magic = inFile.read(4)
    assert readUShort(inFile) == 7
    fileCount = readUShort(inFile)
    if magic == b"ARCC":
        readARCC(inFile,fileCount)
    elif magic == b"ARC\x00":
        extractARC(inFile,fileCount)

if __name__ == "__main__":
    for i, arg in enumerate(sys.argv):
        if i > 0:
            readARC(open(arg,'rb'))