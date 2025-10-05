import crc from "crc";
const constants = {
  "WD_ACAXE": 0x48a636a8,
  "WD_AXE": 0x4aaaa2f5,
  "WD_BOW": 0x4aaaa2f5,
  "WD_CHAXE": 0x48a636a8,
  "WD_GUNLANCE": 0x1a202c47,
  "WD_HAMMER": 0x7edf8bee,
  "WD_HBOWGUN": 0x485826fc,
  "WD_LANCE": 0x48a636a8,
  "WD_LBOWGUN": 0x485826fc,
  "WD_LSWORD2": 0x485826fc,
  "WD_LSWORD": 0x7edf8bee,

  "WD_PIPE": 0xf4a8f8bf,
  "WD_STICK": 0x48a636a8,
  "WD_SWORD": 0x48a636a8,
  "WD_WSWORD": 0x7edf8bee,
  "^l\\d{2}_m\\d{2}_a\\d{2}_\\d{4}$": 0x0a9c75cb, //BLOCK l01_m15_a03_0202
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
  "^note_\\d{5}_\\d{3}_\\d{2}$":0 //NOTE note_00004_004_01

};

// Function to calculate WD_WSWORD-style hash
function calculateHash(data, constant) {
  const checksum = crc.crc32(data);
  return (checksum ^ constant) >>> 0;
}


export function calcMstId(input) {
  // Iterate through the constants object to check if the input matches any regex
  for (const [pattern, constant] of Object.entries(constants)) {
    const regex = new RegExp(pattern); // Create a RegExp object from the pattern string
    if (regex.test(input)) {
      return calculateHash(input, constant); // If matched, return the calculated hash
    }
  }
  
  // If no match is found for any regex, return null
  return null;
}