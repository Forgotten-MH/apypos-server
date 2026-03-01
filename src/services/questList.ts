import { getBlockHashsFromQuestHash, getQuestNameFromQuestHash } from './questService';
import * as fs from 'fs/promises';
import { readFileSync } from 'fs';
import * as path from 'path';
import { createLogger } from '../middleware/logger';
const log = createLogger('questList');

const questType = process.argv[2] || 'event';
const questPath = path.join(__dirname, '..', 'json', 'questDB', `${questType}.json`);
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
      const autoDeleteFalse = val?.mAutoDelete === false || val?.mAutoDelete === 'false';

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
        record[key] = Array.isArray(classrefArray) ? classrefArray : arrayArray;
      } else {
        condenseAutoDeleteArrays(val); // Recurse into deeper structures
      }
    }
  }
}

condenseAutoDeleteArrays(questSheets);

async function enrichAndPersist() {
  const errors: Record<string, number | string | number[]>[] = [];
  const allBlocks: number[] = [];
  for (const obj of questSheets.rQuestSheet.mQuestDataList) {
    try {
      const blocks = (await getBlockHashsFromQuestHash(obj.mQuestID)) as number[];
      obj.mBlocks = blocks;
      blocks.map((block) => {
        allBlocks.push(block);
      });
    } catch (err) {
      log.error(`Failed to get blocks for quest ${obj.mQuestID}:`, err);
      obj.mBlocks = [];
    }

    try {
      obj.mDefineId = await getQuestNameFromQuestHash(obj.mQuestID);
      log.info(obj.mDefineId);
    } catch (err) {
      log.error(`Failed to get blocks for quest ${obj.mQuestID}:`, err);
      obj.mDefineId = '';
    }
  }
  questSheets.rQuestSheet.mQuestDataList.map((obj: Record<string, number | string | number[]>) => {
    if (!obj.mBlocks || (Array.isArray(obj.mBlocks) && obj.mBlocks.length === 0)) {
      errors.push(obj);
    }
    if (!obj.mDefineId || (typeof obj.mDefineId === 'string' && obj.mDefineId.length === 0)) {
      errors.push(obj);
    }
  });
  log.info(originalLen, questSheets.rQuestSheet.mQuestDataList.length);
  try {
    const extendedPath = questPath.replace(/\.json$/, '.extended.json');

    await fs.writeFile(extendedPath, JSON.stringify(questSheets, null, 2), 'utf-8');
    log.info('Extended file saved to:', extendedPath);
    log.info('Errors:', errors);
  } catch (err) {
    log.error('Error writing extended file:', err);
  }
  log.info(allBlocks);
  const extendedPath = questPath.replace(/\.json$/, '.blocks.json');

  await fs.writeFile(extendedPath, JSON.stringify(allBlocks, null, 2), 'utf-8');
}

void enrichAndPersist();
