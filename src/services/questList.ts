import {
  getBlockHashsFromQuestHash,
  getQuestNameFromQuestHash,
} from './questService';
import * as fs from 'fs/promises';
const path = '.\\Projects\\Boromir\\src\\json\\questDB\\event.json'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const questSheets = require(path);
const originalLen = questSheets.rQuestSheet.mQuestDataList.length
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function condenseAutoDeleteArrays(obj: any) {
  if (Array.isArray(obj)) {
    obj.forEach(condenseAutoDeleteArrays);
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key of Object.keys(obj)) {
      const val = obj[key];

      // Normalize mAutoDelete value
      const autoDeleteFalse = val?.mAutoDelete === false || val?.mAutoDelete === 'false';

      // Pattern 1: classref_.mpArray
      const classrefArray = val?.classref_?.mpArray;
      // Pattern 2: array.mpArray
      const arrayArray = val?.array?.mpArray;

      if (
        val &&
        typeof val === 'object' &&
        autoDeleteFalse &&
        (Array.isArray(classrefArray) || Array.isArray(arrayArray))
      ) {
        obj[key] = Array.isArray(classrefArray) ? classrefArray : arrayArray;
      } else {
        condenseAutoDeleteArrays(val); // Recurse into deeper structures
      }
    }
  }
}

condenseAutoDeleteArrays(questSheets);

async function enrichAndPersist() {
  const errors = [];
  const allBlocks = [];
  for (const obj of questSheets.rQuestSheet.mQuestDataList) {
    try {
      
      const blocks: unknown[] = await getBlockHashsFromQuestHash(obj.mQuestID) as unknown[];
      obj.mBlocks = blocks;
      blocks.map((block)=>{
        allBlocks.push(block)
      })
    } catch (err) {
      console.error(`Failed to get blocks for quest ${obj.mQuestID}:`, err);
      obj.mBlocks = [];
    }
    
     try {
      obj.mDefineId = await getQuestNameFromQuestHash(obj.mQuestID);
      console.log(obj.mDefineId)
     
    } catch (err) {
      console.error(`Failed to get blocks for quest ${obj.mQuestID}:`, err);
      obj.mDefineId = '';
    }
  }
  questSheets.rQuestSheet.mQuestDataList.map((obj) => {
    if (!obj.mBlocks || obj.mBlocks.length === 0) {
      errors.push(obj);
    }
    if (!obj.mDefineId || obj.mDefineId.length === 0) {
      errors.push(obj);
    }
  });
  console.log(originalLen,questSheets.rQuestSheet.mQuestDataList.length
)
  try {
    
    const extendedPath = path.replace(/\.json$/, '.extended.json');

    await fs.writeFile(
      extendedPath,
      JSON.stringify(questSheets, null, 2),
      'utf-8'
    );
    console.log('Extended file saved to:', extendedPath);
    console.log('Errors:', errors);
  } catch (err) {
    console.error('Error writing extended file:', err);
  }
console.log(allBlocks)
const extendedPath = path.replace(/\.json$/, '.blocks.json');

    await fs.writeFile(
      extendedPath,
      JSON.stringify(allBlocks, null, 2),
      'utf-8'
    );
}

enrichAndPersist();
