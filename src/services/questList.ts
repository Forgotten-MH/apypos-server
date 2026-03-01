import {
  getBlockHashsFromQuestHash,
  getQuestNameFromQuestHash,
} from './questService';
import * as fs from 'fs/promises';
import { readFileSync } from 'fs';
import * as path from 'path';

const questType = process.argv[2] || 'event';
const questPath = path.join(
  __dirname,
  '..',
  'json',
  'questDB',
  `${questType}.json`
);
const questSheets = JSON.parse(readFileSync(questPath, 'utf-8'));
const originalLen = questSheets.rQuestSheet.mQuestDataList.length;

function condenseAutoDeleteArrays(obj: unknown) {
  if (Array.isArray(obj)) {
    obj.forEach(condenseAutoDeleteArrays);
  } else if (typeof obj === 'object' && obj !== null) {
    const record = obj as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      const val = record[key] as Record<string, unknown> | null;

      // Normalize mAutoDelete value
      const autoDeleteFalse =
        val?.mAutoDelete === false || val?.mAutoDelete === 'false';

      // Pattern 1: classref_.mpArray
      const classref = val?.classref_ as Record<string, unknown> | undefined;
      const classrefArray = classref?.mpArray;
      // Pattern 2: array.mpArray
      const arrayObj = val?.array as Record<string, unknown> | undefined;
      const arrayArray = arrayObj?.mpArray;

      if (
        val &&
        typeof val === 'object' &&
        autoDeleteFalse &&
        (Array.isArray(classrefArray) || Array.isArray(arrayArray))
      ) {
        record[key] = Array.isArray(classrefArray)
          ? classrefArray
          : arrayArray;
      } else {
        condenseAutoDeleteArrays(val); // Recurse into deeper structures
      }
    }
  }
}

condenseAutoDeleteArrays(questSheets);

async function enrichAndPersist() {
  const errors: unknown[] = [];
  const allBlocks: unknown[] = [];
  for (const obj of questSheets.rQuestSheet.mQuestDataList) {
    try {
      const blocks: unknown[] = (await getBlockHashsFromQuestHash(
        obj.mQuestID
      )) as unknown[];
      obj.mBlocks = blocks;
      blocks.map((block) => {
        allBlocks.push(block);
      });
    } catch (err) {
      console.error(`Failed to get blocks for quest ${obj.mQuestID}:`, err);
      obj.mBlocks = [];
    }

    try {
      obj.mDefineId = await getQuestNameFromQuestHash(obj.mQuestID);
      console.log(obj.mDefineId);
    } catch (err) {
      console.error(`Failed to get blocks for quest ${obj.mQuestID}:`, err);
      obj.mDefineId = '';
    }
  }
  questSheets.rQuestSheet.mQuestDataList.map(
    (obj: Record<string, unknown>) => {
      if (
        !obj.mBlocks ||
        (Array.isArray(obj.mBlocks) && obj.mBlocks.length === 0)
      ) {
        errors.push(obj);
      }
      if (
        !obj.mDefineId ||
        (typeof obj.mDefineId === 'string' && obj.mDefineId.length === 0)
      ) {
        errors.push(obj);
      }
    }
  );
  console.log(originalLen, questSheets.rQuestSheet.mQuestDataList.length);
  try {
    const extendedPath = questPath.replace(/\.json$/, '.extended.json');

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
  console.log(allBlocks);
  const extendedPath = questPath.replace(/\.json$/, '.blocks.json');

  await fs.writeFile(
    extendedPath,
    JSON.stringify(allBlocks, null, 2),
    'utf-8'
  );
}

enrichAndPersist();
