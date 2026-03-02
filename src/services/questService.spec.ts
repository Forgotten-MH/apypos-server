import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import {
  lookupValueFromFile,
  getQuestNameFromQuestHash,
  getBlockHashsFromQuestHash,
} from './questService.js';

vi.mock('fs');
vi.mock('../middleware/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }),
}));

const SAMPLE_QUEST_CSV = [
  'Hash,mName,mQuestID',
  '12345,QUEST0010205,100',
  '67890,EVENT92991001,200',
  '11111,QUEST0020301,300',
].join('\n');

const SAMPLE_BLOCKS_CSV = [
  'mName,Hash',
  'l01_forest_quest_0205,50001',
  'l01_forest_quest_0206,50002',
  'l02_desert_quest_0301,60001',
].join('\n');

function mockReadFile(csvByPath: Record<string, string>) {
  vi.mocked(fs.readFile).mockImplementation((...args: unknown[]) => {
    const filePath = args[0] as string;
    const cb = args[2] as (err: NodeJS.ErrnoException | null, data: string) => void;
    // Match by substring to handle different path formats
    const matchedKey = Object.keys(csvByPath).find((key) => filePath.includes(key));
    if (matchedKey) {
      cb(null, csvByPath[matchedKey]!);
    } else {
      cb(null, '');
    }
  });
}

describe('questService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('lookupValueFromFile', () => {
    it('returns the matching value for a given key', async () => {
      mockReadFile({ test: SAMPLE_QUEST_CSV });
      const result = await lookupValueFromFile('test.csv', 'Hash', 'mName', '12345');
      expect(result).toBe('QUEST0010205');
    });

    it('returns null when key is not found', async () => {
      mockReadFile({ test: SAMPLE_QUEST_CSV });
      const result = await lookupValueFromFile('test.csv', 'Hash', 'mName', '99999');
      expect(result).toBeNull();
    });

    it('rejects when column name is invalid', async () => {
      mockReadFile({ test: SAMPLE_QUEST_CSV });
      await expect(
        lookupValueFromFile('test.csv', 'NonExistent', 'mName', '12345'),
      ).rejects.toThrow(/Invalid column name/);
    });

    it('rejects when file read fails', async () => {
      vi.mocked(fs.readFile).mockImplementation((...args: unknown[]) => {
        const cb = args[2];
        (cb as (err: NodeJS.ErrnoException | null, data: string) => void)(
          new Error('ENOENT') as NodeJS.ErrnoException,
          '',
        );
      });

      await expect(lookupValueFromFile('missing.csv', 'Hash', 'mName', '12345')).rejects.toThrow(
        /Error reading file/,
      );
    });

    it('rejects on empty CSV file', async () => {
      mockReadFile({ test: '' });
      await expect(lookupValueFromFile('test.csv', 'Hash', 'mName', '12345')).rejects.toThrow(
        /Empty CSV file/,
      );
    });
  });

  describe('getQuestNameFromQuestHash', () => {
    it('returns quest name for known hash', async () => {
      mockReadFile({ quests: SAMPLE_QUEST_CSV });
      const name = await getQuestNameFromQuestHash('12345');
      expect(name).toBe('QUEST0010205');
    });

    it('returns null for unknown hash', async () => {
      mockReadFile({ quests: SAMPLE_QUEST_CSV });
      const name = await getQuestNameFromQuestHash('99999');
      expect(name).toBeNull();
    });
  });

  describe('getBlockHashsFromQuestHash', () => {
    it('returns block hashes for QUEST-type quest', async () => {
      // First call: quests.csv to get quest name (QUEST0010205)
      // Second call: blocks.csv to lookup blocks by pattern l01_*_0205
      mockReadFile({
        quests: SAMPLE_QUEST_CSV,
        blocks: SAMPLE_BLOCKS_CSV,
      });

      const blocks = await getBlockHashsFromQuestHash('12345');
      expect(blocks).toEqual([50001]);
    });

    it('returns block hashes for EVENT-type quest', async () => {
      // EVENT92991001 => parseString => prefix=EVENT, level=92, remaining=991001
      // part1=remaining[1]='9', part2=remaining[3]='0', combinedName='90'
      // padded to '0090' => pattern l92_*_0090
      const eventBlocksCsv = [
        'mName,Hash',
        'l92_cave_raid_0090,70001',
        'l92_cave_raid_0091,70002',
      ].join('\n');

      mockReadFile({
        quests: SAMPLE_QUEST_CSV,
        blocks: eventBlocksCsv,
      });

      const blocks = await getBlockHashsFromQuestHash('67890');
      expect(blocks).toEqual([70001]);
    });

    it('returns undefined when quest name does not start with QUEST or EVENT', async () => {
      const customCsv = ['Hash,mName', '55555,OTHER_FORMAT'].join('\n');
      mockReadFile({ quests: customCsv, blocks: '' });

      const blocks = await getBlockHashsFromQuestHash('55555');
      expect(blocks).toBeUndefined();
    });

    it('throws when quest hash is not found in CSV', async () => {
      mockReadFile({ quests: SAMPLE_QUEST_CSV, blocks: SAMPLE_BLOCKS_CSV });
      // questName is null, so .startsWith() throws TypeError
      await expect(getBlockHashsFromQuestHash('99999')).rejects.toThrow();
    });
  });
});
