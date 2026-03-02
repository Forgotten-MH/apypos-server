import zlib from 'node:zlib';
import { Blowfish } from 'egoroof-blowfish';
import type { ArcHeader, ArcEntry, ArcFile } from '../types.js';

const ARC_KEY = 'kaseoa nkaeka;eawf3';
const ARC_ENTRY_SIZE = 80; // 64 name + 4 extHash + 4 compSize + 4 decompSize + 4 offset
const ARC_HEADER_SIZE = 8; // 4 magic + 2 version + 2 fileCount
const DECOMP_FLAG = 0x40000000; // ARCC flag added to decompSize

/**
 * Reverse byte order within each 4-byte word.
 * Required for Blowfish encryption/decryption in the ARC format.
 */
export function endiannessReversal(data: Buffer): Buffer {
  const result = Buffer.alloc(data.length);
  for (let i = 0; i + 3 < data.length; i += 4) {
    result[i] = data[i + 3]!;
    result[i + 1] = data[i + 2]!;
    result[i + 2] = data[i + 1]!;
    result[i + 3] = data[i]!;
  }
  // Handle trailing bytes (< 4)
  const remainder = data.length % 4;
  if (remainder > 0) {
    const start = data.length - remainder;
    data.copy(result, start, start);
  }
  return result;
}

function blowfishDecrypt(data: Buffer): Buffer {
  const bf = new Blowfish(ARC_KEY, Blowfish.MODE.ECB, Blowfish.PADDING.NULL);
  const swapped = endiannessReversal(data);
  const decryptedRaw = Buffer.from(bf.decode(swapped, Blowfish.TYPE.UINT8_ARRAY));
  // NULL padding removal may strip trailing zeros — restore to original size
  // since Blowfish ECB preserves data length
  const expectedLen = swapped.length;
  const decrypted =
    decryptedRaw.length < expectedLen
      ? Buffer.concat([decryptedRaw, Buffer.alloc(expectedLen - decryptedRaw.length)])
      : decryptedRaw;
  return endiannessReversal(decrypted);
}

function blowfishEncrypt(data: Buffer): Buffer {
  const bf = new Blowfish(ARC_KEY, Blowfish.MODE.ECB, Blowfish.PADDING.NULL);
  const swapped = endiannessReversal(data);
  const encrypted = Buffer.from(bf.encode(swapped));
  return endiannessReversal(encrypted);
}

function removeNulls(buf: Buffer): string {
  const nullIdx = buf.indexOf(0);
  return buf.toString('utf-8', 0, nullIdx === -1 ? buf.length : nullIdx);
}

export function parseArc(buf: Buffer): ArcFile {
  if (buf.length < ARC_HEADER_SIZE) {
    throw new Error(`Buffer too small for ARC header: ${buf.length} bytes`);
  }

  const magic = buf.toString('ascii', 0, 4);
  if (magic !== 'ARC\0' && magic !== 'ARCC') {
    throw new Error(`Invalid ARC magic: ${JSON.stringify(magic)}`);
  }

  const version = buf.readUInt16LE(4);
  if (version !== 7) {
    throw new Error(`Unsupported ARC version: ${version}`);
  }

  const fileCount = buf.readUInt16LE(6);
  const encrypted = magic === 'ARCC';

  const header: ArcHeader = { magic, version, fileCount };

  // For ARCC, decrypt the body (everything after header)
  let body: Buffer;
  if (encrypted) {
    const encBody = buf.subarray(ARC_HEADER_SIZE);
    body = blowfishDecrypt(encBody);
  } else {
    body = buf.subarray(ARC_HEADER_SIZE);
  }

  // Parse entries from the (decrypted) body
  const entries: ArcEntry[] = [];
  for (let i = 0; i < fileCount; i++) {
    const off = i * ARC_ENTRY_SIZE;
    if (off + ARC_ENTRY_SIZE > body.length) {
      throw new Error(`ARC entry ${i} extends past body`);
    }

    const name = removeNulls(body.subarray(off, off + 64));
    const extHash = body.readUInt32LE(off + 64);
    const compSize = body.readUInt32LE(off + 68);
    const decompSizeRaw = body.readUInt32LE(off + 72);
    const offset = body.readUInt32LE(off + 76);

    // The offset in the entry table is relative to the start of the full file
    // (including the 8-byte header). For encrypted files, we need to adjust
    // since `body` starts after the header.
    const dataStart = offset - ARC_HEADER_SIZE;
    if (dataStart < 0 || dataStart + compSize > body.length) {
      throw new Error(`ARC entry "${name}" data (offset=${offset}, compSize=${compSize}) out of bounds`);
    }

    const compData = body.subarray(dataStart, dataStart + compSize);
    const data = Buffer.from(zlib.inflateSync(compData));

    entries.push({
      name,
      extHash,
      compSize,
      decompSize: decompSizeRaw,
      offset,
      data,
    });
  }

  return { header, entries, encrypted };
}

export interface BuildArcInput {
  name: string; // file path without extension (64 bytes max)
  extHash: number;
  data: Buffer; // uncompressed file data
}

export function buildArc(inputs: BuildArcInput[], encrypted: boolean): Buffer {
  const fileCount = inputs.length;

  // Compress each file
  const compressed: Buffer[] = [];
  for (const input of inputs) {
    let comp = Buffer.from(zlib.deflateSync(input.data));
    // Pad compressed data to 8-byte boundary
    const remainder = comp.length % 8;
    if (remainder !== 0) {
      comp = Buffer.concat([comp, Buffer.alloc(8 - remainder)]);
    }
    compressed.push(comp);
  }

  // Calculate data start: aligned to 32768 boundary
  const headerAndEntries = ARC_HEADER_SIZE + fileCount * ARC_ENTRY_SIZE;
  const dataStart = headerAndEntries + (32768 - (headerAndEntries % 32768));

  // Build body (entry table + padding + file data)
  const entryTableSize = fileCount * ARC_ENTRY_SIZE;
  const paddingSize = dataStart - ARC_HEADER_SIZE - entryTableSize;

  let totalCompSize = 0;
  for (const c of compressed) {
    totalCompSize += c.length;
  }

  const bodySize = entryTableSize + paddingSize + totalCompSize;
  const body = Buffer.alloc(bodySize);

  // Write entry table
  let currentOffset = dataStart; // offset from start of file (including header)
  for (let i = 0; i < fileCount; i++) {
    const input = inputs[i]!;
    const comp = compressed[i]!;
    const off = i * ARC_ENTRY_SIZE;

    // 64-byte name
    const nameBytes = Buffer.from(input.name, 'utf-8');
    if (nameBytes.length > 64) {
      throw new Error(`ARC entry name too long (${nameBytes.length} > 64): ${input.name}`);
    }
    nameBytes.copy(body, off);

    body.writeUInt32LE(input.extHash, off + 64);
    body.writeUInt32LE(comp.length, off + 68);

    // decompSize: real size | DECOMP_FLAG for ARCC
    const decompSize = encrypted ? input.data.length | DECOMP_FLAG : input.data.length;
    body.writeUInt32LE(decompSize, off + 72);

    body.writeUInt32LE(currentOffset, off + 76);

    // Write compressed data
    const dataPos = currentOffset - ARC_HEADER_SIZE;
    comp.copy(body, dataPos);

    currentOffset += comp.length;
  }

  // Build full file
  const headerBuf = Buffer.alloc(ARC_HEADER_SIZE);
  headerBuf.write(encrypted ? 'ARCC' : 'ARC\0', 0, 4, 'ascii');
  headerBuf.writeUInt16LE(7, 4); // version
  headerBuf.writeUInt16LE(fileCount, 6);

  if (encrypted) {
    // Pad body to Blowfish block size (8 bytes)
    let paddedBody = body;
    const rem = paddedBody.length % 8;
    if (rem !== 0) {
      paddedBody = Buffer.concat([paddedBody, Buffer.alloc(8 - rem)]);
    }
    const encBody = blowfishEncrypt(paddedBody);
    return Buffer.concat([headerBuf, encBody]);
  }

  return Buffer.concat([headerBuf, body]);
}

export { ARC_HEADER_SIZE, ARC_ENTRY_SIZE, DECOMP_FLAG };
