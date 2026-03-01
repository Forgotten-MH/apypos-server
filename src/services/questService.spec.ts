import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import { lookupValueFromFile } from './questService';

// Mock fs.readFile to avoid depending on real CSV files
vi.mock('fs');

const SAMPLE_CSV = [
  'Hash,mName,mQuestID',
  '12345,QUEST0010205,100',
  '67890,EVENT92991001,200',
  '11111,QUEST0020301,300',
].join('\n');

describe('questService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('lookupValueFromFile', () => {
    it('returns the matching value for a given key', async () => {
      vi.mocked(fs.readFile).mockImplementation((_path, _enc, cb) => {
        (cb as (err: NodeJS.ErrnoException | null, data: string) => void)(
          null,
          SAMPLE_CSV,
        );
      });

      const result = await lookupValueFromFile(
        'test.csv',
        'Hash',
        'mName',
        '12345',
      );
      expect(result).toBe('QUEST0010205');
    });

    it('returns null when key is not found', async () => {
      vi.mocked(fs.readFile).mockImplementation((_path, _enc, cb) => {
        (cb as (err: NodeJS.ErrnoException | null, data: string) => void)(
          null,
          SAMPLE_CSV,
        );
      });

      const result = await lookupValueFromFile(
        'test.csv',
        'Hash',
        'mName',
        '99999',
      );
      expect(result).toBeNull();
    });

    it('rejects when column name is invalid', async () => {
      vi.mocked(fs.readFile).mockImplementation((_path, _enc, cb) => {
        (cb as (err: NodeJS.ErrnoException | null, data: string) => void)(
          null,
          SAMPLE_CSV,
        );
      });

      await expect(
        lookupValueFromFile('test.csv', 'NonExistent', 'mName', '12345'),
      ).rejects.toMatch(/Invalid column name/);
    });

    it('rejects when file read fails', async () => {
      vi.mocked(fs.readFile).mockImplementation((_path, _enc, cb) => {
        (cb as (err: NodeJS.ErrnoException | null, data: string) => void)(
          new Error('ENOENT') as NodeJS.ErrnoException,
          '',
        );
      });

      await expect(
        lookupValueFromFile('missing.csv', 'Hash', 'mName', '12345'),
      ).rejects.toMatch(/Error reading file/);
    });
  });
});
