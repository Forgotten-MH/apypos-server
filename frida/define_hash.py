import zlib


def jamcrc(data):
    return zlib.crc32(data) ^ 0xFFFFFFFF
    
def define_hash(data,constant):
    return zlib.crc32(data) ^constant


constants = {
    #"/^([A-Z]+)(\d{3})(\d+)$/":0x0a9c75cb,
     "WD_ACAXE": 0x48a636a8,
  "WD_AXE": 0x4aaaa2f5,
  "WD_BOW": 0x4aaaa2f5,
  "WD_CHAXE": 0x48a636a8,
  "WD_GUNLANCE": 0x1a202c47,
  "WD_HAMMER": 0x7edf8bee,
  "WD_HBOWGUN": 0x485826fc,
  "WD_LANCE": 0x48a636a8,
  "WD_LBOWGUN": 0x485826fc,
  "WD_LSWORD": 0x485826fc,
  "WD_PIPE": 0xf4a8f8bf,
  "WD_STICK": 0x48a636a8,
  "WD_SWORD": 0x48a636a8,
  "WD_WSWORD": 0x7edf8bee,
  "BLOCK": 0x0a9c75cb,
  "QUEST": 0x7edf8bee,
  "AUGITE": 0x48a636a8,
  "AD_ARM":0,
  "AD_BODY":0,
  "AD_HEAD":0,
  "AD_LEG":0,
  "AD_WST":0,
  "COLLECTION":0,
  "MATERIAL":0,
  "TRAINING":0x485826fc,
  "TICKET":0,
  "STORY":0,
  "STAMP_SET":0,
  "STAMP":0,
  "SCORE":0,
  "TUTORIAL":0,
  "POTENTIAL_":0,
  "PCOIN":0,
  "ITEM_PTGROW":0,
  "PART":0,
  "OCEAN":0,
}


def main():
    define_strings = []

    for k in constants:
        for i in range(1000):
            define_strings.append(f"{k}{i:03}")
    
    define_strings = list(set(define_strings))
    define_strings.sort()
    
    with open("./MHXR_def_hashes.json", "wt") as f:
        for s in define_strings:
            constant = constants.get(s[:-3])
            def_hash = define_hash(s.encode(),constant)
            output = f'{{"data": "{s}", "define": {def_hash}}},\n'
            print(output)
            f.write(output)

if __name__ == '__main__':
    main()