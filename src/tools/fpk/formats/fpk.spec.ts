import { describe, it, expect } from 'vitest';
import { parseFpk, buildFpk } from './fpk.js';

describe('FPK format', () => {
  it('should round-trip a single-entry FPK', () => {
    const fileData = Buffer.from('Hello FPK world!');
    const inputs = [{ filePath: 'test/file.arc', data: fileData }];

    const [built] = buildFpk(inputs);
    expect(built).toBeDefined();

    const parsed = parseFpk(built!);
    expect(parsed.header.magic).toBe('FPK\0');
    expect(parsed.header.compression).toBe(2);
    expect(parsed.header.fileCount).toBe(1);
    expect(parsed.entries).toHaveLength(1);
    expect(parsed.entries[0]!.filePath).toBe('test/file.arc');
    expect(parsed.entries[0]!.data).toEqual(fileData);
    expect(parsed.entries[0]!.padding).toBe(0xcdcdcdcd);
  });

  it('should round-trip multiple entries', () => {
    const inputs = Array.from({ length: 5 }, (_, i) => ({
      filePath: `arc/file${i}.arc`,
      data: Buffer.from(`data-${i}`),
    }));

    const [built] = buildFpk(inputs);
    const parsed = parseFpk(built!);

    expect(parsed.header.fileCount).toBe(5);
    for (let i = 0; i < 5; i++) {
      expect(parsed.entries[i]!.filePath).toBe(`arc/file${i}.arc`);
      expect(parsed.entries[i]!.data.toString()).toBe(`data-${i}`);
    }
  });

  it('should split at 100 entries into multiple buffers', () => {
    const inputs = Array.from({ length: 150 }, (_, i) => ({
      filePath: `f${i}.arc`,
      data: Buffer.from([i & 0xff]),
    }));

    const bufs = buildFpk(inputs);
    expect(bufs).toHaveLength(2);

    const first = parseFpk(bufs[0]!);
    expect(first.header.fileCount).toBe(100);

    const second = parseFpk(bufs[1]!);
    expect(second.header.fileCount).toBe(50);
  });

  it('should validate FPK magic', () => {
    const bad = Buffer.from('NOPE' + '\0'.repeat(20));
    expect(() => parseFpk(bad)).toThrow('Invalid FPK magic');
  });

  it('should reject too-small buffers', () => {
    expect(() => parseFpk(Buffer.alloc(4))).toThrow('too small');
  });

  it('should reject file paths longer than 64 bytes', () => {
    const longPath = 'a'.repeat(65);
    expect(() => buildFpk([{ filePath: longPath, data: Buffer.alloc(1) }])).toThrow('too long');
  });

  it('should preserve sizeAndFlags with mFlags=1', () => {
    const data = Buffer.alloc(100);
    const [built] = buildFpk([{ filePath: 'test.arc', data }]);
    const parsed = parseFpk(built!);
    // mFlags=1, size=100: (100 & 0x1FFFFFFF) | (1 << 29)
    expect(parsed.entries[0]!.sizeAndFlags).toBe((100 & 0x1fffffff) | (1 << 29));
  });

  it('should handle empty file data', () => {
    const [built] = buildFpk([{ filePath: 'empty.arc', data: Buffer.alloc(0) }]);
    const parsed = parseFpk(built!);
    expect(parsed.entries[0]!.size).toBe(0);
    expect(parsed.entries[0]!.data.length).toBe(0);
  });
});
