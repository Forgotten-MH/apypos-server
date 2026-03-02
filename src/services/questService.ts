import fs from 'fs';
import { createLogger } from '../middleware/logger.js';
const log = createLogger('questService');

export function lookupValueFromFile(
  csvFilePath: string,
  keyColumn: string,
  valueColumn: string,
  lookupKey: string,
) {
  return new Promise((resolve, reject) => {
    fs.readFile(csvFilePath, 'utf-8', (err, data) => {
      if (err) {
        return reject(new Error(`Error reading file: ${err.message}`));
      }

      try {
        const rows = data.split('\n').map((row) => row.trim());
        const headerRow = rows[0];
        if (!headerRow) return reject(new Error('Empty CSV file'));
        const headers = headerRow.split(',');

        const keyIndex = headers.indexOf(keyColumn);
        const valueIndex = headers.indexOf(valueColumn);

        if (keyIndex === -1 || valueIndex === -1) {
          return reject(new Error(`Invalid column name: ${keyColumn} or ${valueColumn}`));
        }

        for (let i = 1; i < rows.length; i++) {
          const cells = rows[i]?.split(',');
          if (cells?.[keyIndex] == lookupKey) {
            return resolve(cells[valueIndex]);
          }
        }
        resolve(null);
      } catch (parseError: unknown) {
        reject(
          new Error(
            `Error parsing CSV: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
          ),
        );
      }
    });
  });
}

function lookupValuesByPattern(
  csvFilePath: string,
  keyColumn: string,
  valueColumn: string,
  level: string,
  suffix: string,
) {
  /**
   * Looks up values in a CSV file where the key matches a specific pattern.
   *
   * @param {string} csvFilePath - Path to the CSV file.
   * @param {string} keyColumn - The column name containing the key.
   * @param {string} valueColumn - The column name containing the value.
   * @param {string} level - The level identifier (e.g., "l01").
   * @param {string} suffix - The suffix to match (e.g., "0101").
   * @returns {Promise<string[]>} - A promise that resolves to an array of values.
   */
  return new Promise((resolve, reject) => {
    fs.readFile(csvFilePath, 'utf-8', (err, data) => {
      if (err) {
        return reject(new Error(`Error reading file: ${err.message}`));
      }

      try {
        const rows = data.split('\n').map((row) => row.trim());
        const headerRow = rows[0];
        if (!headerRow) return reject(new Error('Empty CSV file'));
        const headers = headerRow.split(',');

        const keyIndex = headers.indexOf(keyColumn);
        const valueIndex = headers.indexOf(valueColumn);

        if (keyIndex === -1 || valueIndex === -1) {
          return reject(new Error(`Invalid column name: ${keyColumn} or ${valueColumn}`));
        }

        const results = [];
        let currentSuffix = parseInt(suffix, 10);

        while (results.length === 0) {
          let paddedSuffix = currentSuffix.toString();
          if (paddedSuffix.length < 4) {
            paddedSuffix = paddedSuffix.padStart(4, '0');
          }
          const pattern = new RegExp(`^l${level}_.+_.+_${paddedSuffix}$`);
          log.debug(`Trying pattern: ${pattern}`);
          for (let i = 1; i < rows.length; i++) {
            const cells = rows[i]?.split(',');
            const keyCell = cells?.[keyIndex] ?? '';
            const valueCell = cells?.[valueIndex] ?? '0';
            if (pattern.test(keyCell)) {
              results.push(parseInt(valueCell));
            }
          }
          if (results.length === 0) {
            if (currentSuffix <= parseInt(suffix, 10) + 500) {
              currentSuffix += 100;
            } else {
              return resolve([]);
            }
          }
        }

        log.debug('blocks Found:', results);
        resolve(results);
      } catch (parseError: unknown) {
        reject(
          new Error(
            `Error parsing CSV: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
          ),
        );
      }
    });
  });
}

function parseString(
  input: string,
):
  | { prefix: string; level: string; name: string }
  | { prefix: string; level: string; combinedName: string } {
  if (input.startsWith('QUEST')) {
    // For QUEST format  QUEST 001 0205
    const match = input.match(/^([A-Z]+)(\d{3})(\d+)$/);
    if (!match) throw new Error('Invalid QUEST format');
    const prefix = match[1] ?? '';
    const level = match[2] ?? '';
    const name = match[3] ?? '';
    log.debug(prefix, level, name);
    return { prefix, level, name };
  } else if (input.startsWith('EVENT')) {
    // For EVENT format
    const match = input.match(/^([A-Z]+)(\d{2})(\d+)$/);
    if (!match) throw new Error('Invalid EVENT format');
    const prefix = match[1] ?? '';
    const level = match[2] ?? '';
    const remaining = match[3] ?? '';

    // Split remaining digits into part1 and part2
    log.debug(remaining);
    const part1 = remaining.charAt(1);
    log.debug('part1', part1);
    const part2 = remaining.charAt(3);
    log.debug('part2', part2);

    return { prefix, level, combinedName: part1 + part2 };
  } else {
    throw new Error('Unsupported input format');
  }
}
function formatNumber(num: string) {
  const formatted = parseInt(num, 10).toString();
  return formatted.length === 1 ? `0${formatted}` : formatted;
}

export const getQuestNameFromQuestHash = async (questHash: string) => {
  const questCsvFilePath = './src/csv/quests.csv';
  log.debug('Quest Hash Inserted:', questHash);
  return await lookupValueFromFile(questCsvFilePath, 'Hash', 'mName', questHash);
};
export const getBlockHashsFromQuestHash = async (
  questHash: string,
): Promise<number[] | undefined> => {
  const csvFilePath = './src/csv/blocks.csv';
  log.debug('Quest Hash Inserted:', questHash);
  const questName = (await getQuestNameFromQuestHash(questHash)) as string;
  log.debug('Quest Name Found:', questName);
  if (questName.startsWith('QUEST')) {
    //TODO Quest Look up works... just needs reversing...
    const parsed = parseString(questName);
    log.debug('prefix', parsed.prefix, 'level', parsed.level);

    if ('name' in parsed) {
      return (await lookupValuesByPattern(
        csvFilePath,
        'mName',
        'Hash',
        formatNumber(parsed.level),
        parsed.name,
      )) as number[];
    }
  } else if (questName.startsWith('EVENT')) {
    //EVENT 92 99 001
    //EVENT 92 15 6002
    //EVENT 92 19 1001
    const parsed = parseString(questName);

    if ('combinedName' in parsed) {
      return (await lookupValuesByPattern(
        csvFilePath,
        'mName',
        'Hash',
        parsed.level,
        parsed.combinedName.padStart(4, '0'),
      )) as number[];
    }
  }
  return undefined;
};
