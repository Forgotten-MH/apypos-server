import { parse } from "path";

const fs = require("fs");

export function lookupValueFromFile(
  csvFilePath,
  keyColumn,
  valueColumn,
  lookupKey
) {
  return new Promise((resolve, reject) => {
    fs.readFile(csvFilePath, "utf-8", (err, data) => {
      if (err) {
        return reject(`Error reading file: ${err.message}`);
      }

      try {
        const rows = data.split("\n").map((row) => row.trim());
        const headers = rows[0].split(",");

        const keyIndex = headers.indexOf(keyColumn);
        const valueIndex = headers.indexOf(valueColumn);

        if (keyIndex === -1 || valueIndex === -1) {
          return reject(`Invalid column name: ${keyColumn} or ${valueColumn}`);
        }

        for (let i = 1; i < rows.length; i++) {
          const cells = rows[i].split(",");
          if (cells[keyIndex] == lookupKey) {
            return resolve(cells[valueIndex]);
          }
        }
        resolve(null);
      } catch (parseError) {
        reject(`Error parsing CSV: ${parseError.message}`);
      }
    });
  });
}

function lookupValuesByPattern(
  csvFilePath,
  keyColumn,
  valueColumn,
  level,
  suffix
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
    fs.readFile(csvFilePath, "utf-8", (err, data) => {
      if (err) {
        return reject(`Error reading file: ${err.message}`);
      }

      try {
        const rows = data.split("\n").map((row) => row.trim());
        const headers = rows[0].split(",");

        const keyIndex = headers.indexOf(keyColumn);
        const valueIndex = headers.indexOf(valueColumn);

        if (keyIndex === -1 || valueIndex === -1) {
          return reject(`Invalid column name: ${keyColumn} or ${valueColumn}`);
        }

        let results = [];
        let currentSuffix = parseInt(suffix, 10);

        while (results.length === 0) {
          let paddedSuffix = currentSuffix.toString();
          if (paddedSuffix.length < 4) {
            paddedSuffix = paddedSuffix.padStart(4, "0");
          }
          const pattern = new RegExp(`^l${level}_.+_.+_${paddedSuffix}$`);
          console.log(`Trying pattern: ${pattern}`);
          for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].split(",");
            if (pattern.test(cells[keyIndex])) {
              results.push(parseInt(cells[valueIndex]));
            }
          }
          if (results.length === 0) {
            if (currentSuffix <= suffix + 500) {
              currentSuffix += 100;
            } else {
              return resolve([]);
            }
          }
        }

        console.log("blocks Found:", results);
        resolve(results);
      } catch (parseError) {
        reject(`Error parsing CSV: ${parseError.message}`);
      }
    });
  });
}

function parseString(input) {
  let match;
  if (input.startsWith("QUEST")) {
    // For QUEST format  QUEST 001 0205

    match = input.match(/^([A-Z]+)(\d{3})(\d+)$/);
    if (!match) throw new Error("Invalid QUEST format");
    const [, prefix, level, name] = match;
    console.log(prefix, level, name);
    return { prefix, level, name };
  } else if (input.startsWith("EVENT")) {
    // For EVENT format
    match = input.match(/^([A-Z]+)(\d{2})(\d+)$/);
    if (!match) throw new Error("Invalid EVENT format");
    const [, prefix, level, remaining] = match;

    // Split remaining digits into part1 and part2
    console.log(remaining);
    const part1 = remaining.charAt(1);
    console.log("part1", part1);
    const part2 = remaining.charAt(3);
    console.log("part2", part2);

    return { prefix, level, combinedName: part1 + part2 };
  } else {
    throw new Error("Unsupported input format");
  }
}
function formatNumber(num) {
  let formatted = parseInt(num, 10).toString();
  return formatted.length === 1 ? `0${formatted}` : formatted;
}

export const getQuestNameFromQuestHash = async (questHash) => {
  const questCsvFilePath = "./src/csv/quests.csv";
  console.log("Quest Hash Inserted:", questHash);
  return await lookupValueFromFile(
    questCsvFilePath,
    "Hash",
    "mName",
    questHash
  );
};
export const getBlockHashsFromQuestHash = async (questHash) => {
  const csvFilePath = "./src/csv/blocks.csv";
  console.log("Quest Hash Inserted:", questHash);
  const questName: any = await getQuestNameFromQuestHash(questHash);
  console.log("Quest Name Found:", questName);
  if (questName.startsWith("QUEST")) {
    //TODO Quest Look up works... just needs reversing...
    const { prefix, level, name } = parseString(questName);
    console.log("prefix", prefix, "level", level, "name");

    return await lookupValuesByPattern(
      csvFilePath,
      "mName",
      "Hash",
      formatNumber(level),
      name
    );
  } else if (questName.startsWith("EVENT")) {
    //EVENT 92 99 001
    //EVENT 92 15 6002
    //EVENT 92 19 1001
    const { prefix, level, combinedName } = parseString(questName);

    return await lookupValuesByPattern(
      csvFilePath,
      "mName",
      "Hash",
      level,
      combinedName.toString().padStart(4, "0")
    );
  }
};
