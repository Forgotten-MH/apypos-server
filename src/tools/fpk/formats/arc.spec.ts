import { describe, it, expect } from 'vitest';
import { parseArc, buildArc, endiannessReversal } from './arc.js';

describe('ARC format', () => {
  describe('endiannessReversal', () => {
    it('should reverse bytes within each 4-byte word', () => {
      const input = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);
      const result = endiannessReversal(input);
      expect(result).toEqual(Buffer.from([0x04, 0x03, 0x02, 0x01, 0x08, 0x07, 0x06, 0x05]));
    });

    it('should be self-inverse', () => {
      const input = Buffer.from([0xAA, 0xBB, 0xCC, 0xDD, 0x11, 0x22, 0x33, 0x44]);
      const result = endiannessReversal(endiannessReversal(input));
      expect(result).toEqual(input);
    });

    it('should handle trailing bytes', () => {
      const input = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06]);
      const result = endiannessReversal(input);
      // First 4 bytes reversed, last 2 copied as-is
      expect(result).toEqual(Buffer.from([0x04, 0x03, 0x02, 0x01, 0x05, 0x06]));
    });
  });

  describe('plain ARC (unencrypted)', () => {
    it('should round-trip a single file', () => {
      const fileData = Buffer.from('Hello ARC world!');
      const inputs = [{ name: 'test/file', extHash: 0x12345678, data: fileData }];

      const built = buildArc(inputs, false);
      const parsed = parseArc(built);

      expect(parsed.header.magic).toBe('ARC\0');
      expect(parsed.header.version).toBe(7);
      expect(parsed.header.fileCount).toBe(1);
      expect(parsed.encrypted).toBe(false);
      expect(parsed.entries).toHaveLength(1);
      expect(parsed.entries[0]!.name).toBe('test/file');
      expect(parsed.entries[0]!.extHash).toBe(0x12345678);
      expect(parsed.entries[0]!.data).toEqual(fileData);
    });

    it('should round-trip multiple files', () => {
      const inputs = Array.from({ length: 3 }, (_, i) => ({
        name: `path/file${i}`,
        extHash: 0xaabb0000 + i,
        data: Buffer.from(`content-${i}`),
      }));

      const built = buildArc(inputs, false);
      const parsed = parseArc(built);

      expect(parsed.entries).toHaveLength(3);
      for (let i = 0; i < 3; i++) {
        expect(parsed.entries[i]!.name).toBe(`path/file${i}`);
        expect(parsed.entries[i]!.data.toString()).toBe(`content-${i}`);
      }
    });
  });

  describe('ARCC (encrypted)', () => {
    it('should round-trip a single file with encryption', () => {
      const fileData = Buffer.from('Hello encrypted ARC!');
      const inputs = [{ name: 'enc/test', extHash: 0xdeadbeef, data: fileData }];

      const built = buildArc(inputs, true);
      // Check that the magic is ARCC
      expect(built.toString('ascii', 0, 4)).toBe('ARCC');

      const parsed = parseArc(built);
      expect(parsed.encrypted).toBe(true);
      expect(parsed.entries).toHaveLength(1);
      expect(parsed.entries[0]!.name).toBe('enc/test');
      expect(parsed.entries[0]!.data).toEqual(fileData);
    });

    it('should round-trip multiple files with encryption', () => {
      const inputs = Array.from({ length: 5 }, (_, i) => ({
        name: `enc/file${i}`,
        extHash: 0x10000 + i,
        data: Buffer.from(`encrypted-data-${i}-${'x'.repeat(50)}`),
      }));

      const built = buildArc(inputs, true);
      const parsed = parseArc(built);

      expect(parsed.entries).toHaveLength(5);
      for (let i = 0; i < 5; i++) {
        expect(parsed.entries[i]!.name).toBe(`enc/file${i}`);
        expect(parsed.entries[i]!.data.toString()).toBe(`encrypted-data-${i}-${'x'.repeat(50)}`);
      }
    });
  });

  describe('validation', () => {
    it('should reject invalid magic', () => {
      expect(() => parseArc(Buffer.from('XXXX\x07\x00\x01\x00'))).toThrow('Invalid ARC magic');
    });

    it('should reject unsupported version', () => {
      const buf = Buffer.alloc(8);
      buf.write('ARC\0', 0, 4, 'ascii');
      buf.writeUInt16LE(99, 4);
      buf.writeUInt16LE(0, 6);
      expect(() => parseArc(buf)).toThrow('Unsupported ARC version');
    });
  });
});
