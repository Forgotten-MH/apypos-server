import type { FpkHeader, FpkEntry, FpkFile } from '../types.js';

const FPK_MAGIC = 'FPK\0';
const HEADER_SIZE = 16; // 4 magic + 4 field4 + 4 field8 + 2 compression + 2 fileCount
const ENTRY_SIZE = 80; // 64 filepath + 4 padding + 4 size + 4 sizeAndFlags + 4 offset
const MAX_ENTRIES_PER_FPK = 100;

export function parseFpk(buf: Buffer): FpkFile {
  if (buf.length < HEADER_SIZE) {
    throw new Error(`Buffer too small for FPK header: ${buf.length} bytes`);
  }

  const magic = buf.toString('ascii', 0, 4);
  if (magic !== FPK_MAGIC) {
    throw new Error(`Invalid FPK magic: ${JSON.stringify(magic)}`);
  }

  const header: FpkHeader = {
    magic,
    field4: buf.readUInt32LE(4),
    field8: buf.readUInt32LE(8),
    compression: buf.readUInt16LE(12),
    fileCount: buf.readUInt16LE(14),
  };

  const entries: FpkEntry[] = [];
  for (let i = 0; i < header.fileCount; i++) {
    const entryOffset = HEADER_SIZE + i * ENTRY_SIZE;
    if (entryOffset + ENTRY_SIZE > buf.length) {
      throw new Error(`FPK entry ${i} extends past buffer`);
    }

    // Read 64-byte null-padded filepath
    const pathBuf = buf.subarray(entryOffset, entryOffset + 64);
    const nullIdx = pathBuf.indexOf(0);
    const filePath = pathBuf.toString('utf-8', 0, nullIdx === -1 ? 64 : nullIdx);

    const padding = buf.readUInt32LE(entryOffset + 64);
    const size = buf.readUInt32LE(entryOffset + 68);
    const sizeAndFlags = buf.readUInt32LE(entryOffset + 72);
    const offset = buf.readUInt32LE(entryOffset + 76);

    if (offset + size > buf.length) {
      throw new Error(`FPK entry "${filePath}" data (offset=${offset}, size=${size}) extends past buffer`);
    }

    const data = Buffer.from(buf.subarray(offset, offset + size));

    entries.push({ filePath, padding, size, sizeAndFlags, offset, data });
  }

  return { header, entries };
}

export interface BuildFpkInput {
  filePath: string;
  data: Buffer;
}

/**
 * Build one or more FPK buffers from a list of entries.
 * Splits at MAX_ENTRIES_PER_FPK (100) entries per buffer.
 */
export function buildFpk(inputs: BuildFpkInput[], options?: { compression?: number }): Buffer[] {
  const compression = options?.compression ?? 2;
  const mFlags = 1;
  const results: Buffer[] = [];

  for (let start = 0; start < inputs.length; start += MAX_ENTRIES_PER_FPK) {
    const chunk = inputs.slice(start, start + MAX_ENTRIES_PER_FPK);
    results.push(buildSingleFpk(chunk, compression, mFlags));
  }

  return results;
}

function buildSingleFpk(entries: BuildFpkInput[], compression: number, mFlags: number): Buffer {
  const tableSize = HEADER_SIZE + entries.length * ENTRY_SIZE;
  let dataOffset = tableSize;

  // Calculate total size
  let totalDataSize = 0;
  for (const entry of entries) {
    totalDataSize += entry.data.length;
  }

  const buf = Buffer.alloc(tableSize + totalDataSize);

  // Write header
  buf.write(FPK_MAGIC, 0, 4, 'ascii');
  buf.writeUInt32LE(0, 4); // field4
  buf.writeUInt32LE(0, 8); // field8
  buf.writeUInt16LE(compression, 12);
  buf.writeUInt16LE(entries.length, 14);

  // Write entries and data
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]!;
    const entryPos = HEADER_SIZE + i * ENTRY_SIZE;

    // 64-byte null-padded filepath
    const pathBytes = Buffer.from(entry.filePath, 'utf-8');
    if (pathBytes.length > 64) {
      throw new Error(`File path too long (${pathBytes.length} > 64): ${entry.filePath}`);
    }
    pathBytes.copy(buf, entryPos);
    // Rest is already zeroed by Buffer.alloc

    // Padding 0xCDCDCDCD
    buf.writeUInt32LE(0xcdcdcdcd, entryPos + 64);

    // Size
    buf.writeUInt32LE(entry.data.length, entryPos + 68);

    // sizeAndFlags
    const sizeAndFlags = (entry.data.length & 0x1fffffff) | (mFlags << 29);
    buf.writeUInt32LE(sizeAndFlags, entryPos + 72);

    // Offset (will be filled with actual data offset)
    buf.writeUInt32LE(dataOffset, entryPos + 76);

    // Write file data
    entry.data.copy(buf, dataOffset);
    dataOffset += entry.data.length;
  }

  return buf;
}

export { HEADER_SIZE, ENTRY_SIZE, MAX_ENTRIES_PER_FPK };
