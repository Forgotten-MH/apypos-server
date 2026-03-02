import {
  DtiType,
  type XfsHeader,
  type XfsPropertyDef,
  type XfsClassDef,
  type XfsClassRef,
  type XfsFieldValue,
  type XfsField,
  type XfsSerializedObject,
  type XfsDocument,
  type XfsJson,
  type XfsJsonClass,
  type XfsJsonProperty,
} from '../types.js';

const XFS_MAGIC = 'XFS\0';
const HEADER_SIZE = 24; // 4 magic + 2 version + 2 type + 8 classCount + 4 defCount + 4 defSize
const PROPERTY_SIZE = 40; // 4 nameOffset + 1 type + 1 attr + 2 bytes/disabled + 32 pad

// ── Helpers ─────────────────────────────────────────────────────────────────

const DTI_TYPE_NAMES = new Map<number, string>();
for (const [name, value] of Object.entries(DtiType)) {
  if (typeof value === 'number') {
    DTI_TYPE_NAMES.set(value, name);
  }
}

function dtiTypeName(type: number): string {
  return DTI_TYPE_NAMES.get(type) ?? `UNKNOWN_0x${type.toString(16)}`;
}

function readNullString(buf: Buffer, offset: number): string {
  const end = buf.indexOf(0, offset);
  return buf.toString('utf-8', offset, end === -1 ? buf.length : end);
}

// ── Parse ───────────────────────────────────────────────────────────────────

export function parseXfs(buf: Buffer): XfsDocument {
  if (buf.length < HEADER_SIZE) {
    throw new Error(`Buffer too small for XFS header: ${buf.length} bytes`);
  }

  const magic = buf.toString('ascii', 0, 4);
  if (magic !== XFS_MAGIC) {
    throw new Error(`Invalid XFS magic: ${JSON.stringify(magic)}`);
  }

  const header: XfsHeader = {
    magic,
    version: buf.readUInt16LE(4),
    type: buf.readUInt16LE(6),
    classCount: buf.readBigInt64LE(8),
    defCount: buf.readInt32LE(16),
    defSize: buf.readInt32LE(20),
  };

  if (header.version !== 16) {
    throw new Error(`Unsupported XFS version: ${header.version} (expected 16)`);
  }

  // Parse object definitions
  // The definition block starts right after the header.
  // First 4 bytes = offset to the definitions array (relative to current position)
  const defBlockStart = HEADER_SIZE;
  const defsRelOffset = buf.readInt32LE(defBlockStart);
  const defsAbsStart = defBlockStart + defsRelOffset;

  const classes: XfsClassDef[] = [];
  let pos = defsAbsStart;

  for (let d = 0; d < header.defCount; d++) {
    const dtiHash = buf.readUInt32LE(pos);
    const propField = buf.readUInt32LE(pos + 4);
    const propNum = propField & 0x7fff; // lower 15 bits
    const upper17 = propField >>> 15;
    pos += 8;

    const properties: XfsPropertyDef[] = [];
    for (let p = 0; p < propNum; p++) {
      const nameOffset = buf.readUInt32LE(pos);
      const type = buf.readUInt8(pos + 4) as DtiType;
      const attr = buf.readUInt8(pos + 5);
      const bytesDisabled = buf.readUInt16LE(pos + 6);
      const bytes = bytesDisabled & 0x7fff;
      const disabled = (bytesDisabled >>> 15) & 1;
      const _pad = Buffer.from(buf.subarray(pos + 8, pos + PROPERTY_SIZE));

      // Resolve name from definition block string table
      const nameAbsOffset = HEADER_SIZE + nameOffset;
      const name = readNullString(buf, nameAbsOffset);

      properties.push({ nameOffset, name, type, attr, bytes, disabled, _pad });
      pos += PROPERTY_SIZE;
    }

    classes.push({ dtiHash, propNum, _upper17: upper17, properties });
  }

  // Parse serialized data — starts at HEADER_SIZE + defSize
  const dataStart = HEADER_SIZE + header.defSize;
  const ctx: ParseContext = { buf, classes, pos: dataStart };
  const root = parseClassRef(ctx);

  return { header, classes, root };
}

interface ParseContext {
  buf: Buffer;
  classes: XfsClassDef[];
  pos: number;
}

function parseClassRef(ctx: ParseContext): XfsClassRef {
  const type = ctx.buf.readInt16LE(ctx.pos);
  const variant = ctx.buf.readInt16LE(ctx.pos + 2);
  ctx.pos += 4;

  // Null/empty reference
  if (type === 0x7fff || (type & 1) === 0) {
    return { type, variant };
  }

  const size = ctx.buf.readUInt32LE(ctx.pos);
  ctx.pos += 4;

  const classIndex = type >> 1;
  const object = parseSerializedObject(ctx, classIndex);

  return { type, variant, size, object };
}

function parseSerializedObject(ctx: ParseContext, classIndex: number): XfsSerializedObject {
  const classDef = ctx.classes[classIndex];
  if (!classDef) {
    throw new Error(`XFS class index ${classIndex} out of range (${ctx.classes.length} classes)`);
  }

  const fields: XfsField[] = [];
  for (let i = 0; i < classDef.propNum; i++) {
    const prop = classDef.properties[i]!;
    const count = ctx.buf.readInt32LE(ctx.pos);
    ctx.pos += 4;

    const values: XfsFieldValue[] = [];
    for (let j = 0; j < count; j++) {
      values.push(parseFieldValue(ctx, prop.type));
    }

    fields.push({ count, values });
  }

  return { classIndex, fields };
}

function parseFieldValue(ctx: ParseContext, type: DtiType): XfsFieldValue {
  switch (type) {
    case DtiType.CLASS:
    case DtiType.CLASSREF: {
      const classRef = parseClassRef(ctx);
      return { classRef };
    }
    case DtiType.BOOL: {
      const value = ctx.buf.readUInt8(ctx.pos) !== 0;
      ctx.pos += 1;
      return { value };
    }
    case DtiType.U8: {
      const value = ctx.buf.readUInt8(ctx.pos);
      ctx.pos += 1;
      return { value };
    }
    case DtiType.U16: {
      const value = ctx.buf.readUInt16LE(ctx.pos);
      ctx.pos += 2;
      return { value };
    }
    case DtiType.U32: {
      const value = ctx.buf.readUInt32LE(ctx.pos);
      ctx.pos += 4;
      return { value };
    }
    case DtiType.U64: {
      const value = ctx.buf.readBigUInt64LE(ctx.pos).toString();
      ctx.pos += 8;
      return { value };
    }
    case DtiType.S8: {
      const value = ctx.buf.readInt8(ctx.pos);
      ctx.pos += 1;
      return { value };
    }
    case DtiType.S16: {
      const value = ctx.buf.readInt16LE(ctx.pos);
      ctx.pos += 2;
      return { value };
    }
    case DtiType.S32: {
      const value = ctx.buf.readInt32LE(ctx.pos);
      ctx.pos += 4;
      return { value };
    }
    case DtiType.S64: {
      const value = ctx.buf.readBigInt64LE(ctx.pos).toString();
      ctx.pos += 8;
      return { value };
    }
    case DtiType.F32: {
      const value = ctx.buf.readFloatLE(ctx.pos);
      ctx.pos += 4;
      return { value };
    }
    case DtiType.F64: {
      const value = ctx.buf.readDoubleLE(ctx.pos);
      ctx.pos += 8;
      return { value };
    }
    case DtiType.STRING:
    case DtiType.CSTRING: {
      const value = readNullString(ctx.buf, ctx.pos);
      ctx.pos += value.length + 1; // +1 for null terminator
      return { value };
    }
    case DtiType.VECTOR3: {
      const x = ctx.buf.readFloatLE(ctx.pos);
      const y = ctx.buf.readFloatLE(ctx.pos + 4);
      const z = ctx.buf.readFloatLE(ctx.pos + 8);
      ctx.pos += 12;
      return { value: { x, y, z } };
    }
    case DtiType.VECTOR4:
    case DtiType.QUATERNION: {
      const x = ctx.buf.readFloatLE(ctx.pos);
      const y = ctx.buf.readFloatLE(ctx.pos + 4);
      const z = ctx.buf.readFloatLE(ctx.pos + 8);
      const w = ctx.buf.readFloatLE(ctx.pos + 12);
      ctx.pos += 16;
      return { value: { x, y, z, w } };
    }
    case DtiType.COLOR: {
      const r = ctx.buf.readUInt8(ctx.pos);
      const g = ctx.buf.readUInt8(ctx.pos + 1);
      const b = ctx.buf.readUInt8(ctx.pos + 2);
      const a = ctx.buf.readUInt8(ctx.pos + 3);
      ctx.pos += 4;
      return { value: { r, g, b, a } };
    }
    case DtiType.CUSTOM: {
      const strCount = ctx.buf.readUInt8(ctx.pos);
      ctx.pos += 1;
      const strings: string[] = [];
      for (let s = 0; s < strCount; s++) {
        const str = readNullString(ctx.buf, ctx.pos);
        ctx.pos += str.length + 1;
        strings.push(str);
      }
      return { value: strings };
    }
    default: {
      // Unknown type — store raw byte as hex
      const raw = ctx.buf.readUInt8(ctx.pos).toString(16).padStart(2, '0');
      ctx.pos += 1;
      return { _raw: raw };
    }
  }
}

// ── JSON conversion ─────────────────────────────────────────────────────────

export function xfsToJson(doc: XfsDocument): XfsJson {
  const _classes: XfsJsonClass[] = doc.classes.map((cls) => ({
    dtiHash: cls.dtiHash,
    propNum: cls.propNum,
    _upper17: cls._upper17,
    properties: cls.properties.map(
      (p): XfsJsonProperty => ({
        nameOffset: p.nameOffset,
        name: p.name,
        type: p.type,
        typeName: dtiTypeName(p.type),
        attr: p.attr,
        bytes: p.bytes,
        disabled: p.disabled,
      }),
    ),
  }));

  return {
    _format: 'xfs-v16',
    _header: {
      version: doc.header.version,
      type: doc.header.type,
      classCount: doc.header.classCount.toString(),
      defCount: doc.header.defCount,
      defSize: doc.header.defSize,
    },
    _classes,
    root: classRefToJson(doc, doc.root),
  };
}

function classRefToJson(doc: XfsDocument, ref: XfsClassRef): unknown {
  if (ref.type === 0x7fff || (ref.type & 1) === 0) {
    return null;
  }
  if (!ref.object) return null;

  const classDef = doc.classes[ref.object.classIndex];
  if (!classDef) return null;

  const result: Record<string, unknown> = {
    _classIndex: ref.object.classIndex,
    _type: ref.type,
    _variant: ref.variant,
  };

  for (let i = 0; i < classDef.propNum; i++) {
    const prop = classDef.properties[i]!;
    const field = ref.object.fields[i]!;

    if (field.count === 0) {
      result[prop.name] = [];
      continue;
    }

    const values = field.values.map((v) => fieldValueToJson(doc, v, prop.type));
    result[prop.name] = field.count === 1 ? values[0] : values;
  }

  return result;
}

function fieldValueToJson(doc: XfsDocument, val: XfsFieldValue, _type: DtiType): unknown {
  if (val._raw !== undefined) return { _raw: val._raw };
  if (val.classRef !== undefined) return classRefToJson(doc, val.classRef);
  return val.value;
}

// ── JSON → XfsDocument ──────────────────────────────────────────────────────

export function jsonToXfs(json: XfsJson): XfsDocument {
  if (json._format !== 'xfs-v16') {
    throw new Error(`Unsupported format: ${String(json._format)}`);
  }

  const classes: XfsClassDef[] = json._classes.map((jc) => ({
    dtiHash: jc.dtiHash,
    propNum: jc.propNum,
    _upper17: jc._upper17,
    properties: jc.properties.map(
      (jp): XfsPropertyDef => ({
        nameOffset: jp.nameOffset,
        name: jp.name,
        type: jp.type as DtiType,
        attr: jp.attr,
        bytes: jp.bytes,
        disabled: jp.disabled,
        _pad: Buffer.alloc(32),
      }),
    ),
  }));

  const header: XfsHeader = {
    magic: XFS_MAGIC,
    version: json._header.version,
    type: json._header.type,
    classCount: BigInt(json._header.classCount),
    defCount: json._header.defCount,
    defSize: json._header.defSize,
  };

  const root = jsonToClassRef(json.root, classes);

  return { header, classes, root };
}

function jsonToClassRef(
  json: unknown,
  classes: XfsClassDef[],
): XfsClassRef {
  if (json === null || json === undefined) {
    return { type: 0x7fff, variant: 0 };
  }

  const obj = json as Record<string, unknown>;
  const classIndex = obj['_classIndex'] as number;
  const type = obj['_type'] as number;
  const variant = obj['_variant'] as number;

  const classDef = classes[classIndex];
  if (!classDef) {
    throw new Error(`Class index ${classIndex} out of range`);
  }

  const fields: XfsField[] = [];
  for (let i = 0; i < classDef.propNum; i++) {
    const prop = classDef.properties[i]!;
    const rawVal = obj[prop.name];

    if (rawVal === undefined || (Array.isArray(rawVal) && rawVal.length === 0)) {
      fields.push({ count: 0, values: [] });
      continue;
    }

    const rawArr = Array.isArray(rawVal) ? rawVal : [rawVal];
    const values = rawArr.map((v: unknown) => jsonToFieldValue(v, prop.type, classes));
    fields.push({ count: values.length, values });
  }

  const object: XfsSerializedObject = { classIndex, fields };
  return { type, variant, size: 0, object }; // size will be computed during build
}

function jsonToFieldValue(
  json: unknown,
  type: DtiType,
  classes: XfsClassDef[],
): XfsFieldValue {
  switch (type) {
    case DtiType.CLASS:
    case DtiType.CLASSREF:
      return { classRef: jsonToClassRef(json, classes) };
    default:
      if (json !== null && typeof json === 'object' && '_raw' in (json as Record<string, unknown>)) {
        return { _raw: (json as Record<string, string>)['_raw'] };
      }
      return { value: json };
  }
}

// ── Build binary ────────────────────────────────────────────────────────────

export function buildXfs(doc: XfsDocument): Buffer {
  // Phase 1: Build definition block (string table + definitions)
  const defBlock = buildDefBlock(doc);

  // Phase 2: Build serialized data
  const dataBlock = buildDataBlock(doc);

  // Write header
  const header = Buffer.alloc(HEADER_SIZE);
  header.write(XFS_MAGIC, 0, 4, 'ascii');
  header.writeUInt16LE(doc.header.version, 4);
  header.writeUInt16LE(doc.header.type, 6);
  header.writeBigInt64LE(doc.header.classCount, 8);
  header.writeInt32LE(doc.header.defCount, 16);
  header.writeInt32LE(defBlock.length, 20);

  return Buffer.concat([header, defBlock, dataBlock]);
}

function buildDefBlock(doc: XfsDocument): Buffer {
  // The def block layout in the file (starting at HEADER_SIZE):
  //   [4-byte relOffset] [string data area...] [definitions...]
  //
  // nameOffset is relative to the def block start (byte 0 = the relOffset field).
  // So nameOffset=4 means byte 4 of the def block = first byte after relOffset.
  //
  // relOffset = distance from def block start to the definitions array.

  // Find the extent of the string area (nameOffset values reference into def block)
  let stringAreaEnd = 4; // minimum: after the relOffset field
  for (const cls of doc.classes) {
    for (const prop of cls.properties) {
      const end = prop.nameOffset + Buffer.byteLength(prop.name, 'utf-8') + 1;
      if (end > stringAreaEnd) stringAreaEnd = end;
    }
  }

  // Build definitions
  const defParts: Buffer[] = [];
  for (const cls of doc.classes) {
    const defHeader = Buffer.alloc(8);
    defHeader.writeUInt32LE(cls.dtiHash, 0);
    const propField = (cls.propNum & 0x7fff) | (cls._upper17 << 15);
    defHeader.writeUInt32LE(propField, 4);
    defParts.push(defHeader);

    for (const prop of cls.properties) {
      const propBuf = Buffer.alloc(PROPERTY_SIZE);
      propBuf.writeUInt32LE(prop.nameOffset, 0);
      propBuf.writeUInt8(prop.type, 4);
      propBuf.writeUInt8(prop.attr, 5);
      const bytesDisabled = (prop.bytes & 0x7fff) | ((prop.disabled & 1) << 15);
      propBuf.writeUInt16LE(bytesDisabled, 6);
      prop._pad.copy(propBuf, 8, 0, 32);
      defParts.push(propBuf);
    }
  }

  const defsData = Buffer.concat(defParts);

  // Assemble the full def block as one buffer
  const defsStartInBlock = stringAreaEnd;
  const totalSize = defsStartInBlock + defsData.length;
  const defBlock = Buffer.alloc(totalSize);

  // Write relOffset at byte 0 (points from def block start to definitions)
  defBlock.writeInt32LE(defsStartInBlock, 0);

  // Write strings at their nameOffset positions within the def block
  for (const cls of doc.classes) {
    for (const prop of cls.properties) {
      defBlock.write(prop.name, prop.nameOffset, 'utf-8');
      // null terminator already 0 from alloc
    }
  }

  // Write definitions at defsStartInBlock
  defsData.copy(defBlock, defsStartInBlock);

  return defBlock;
}

function buildDataBlock(doc: XfsDocument): Buffer {
  const parts: Buffer[] = [];
  writeClassRef(parts, doc, doc.root);
  return Buffer.concat(parts);
}

function writeClassRef(parts: Buffer[], doc: XfsDocument, ref: XfsClassRef): void {
  const header = Buffer.alloc(4);
  header.writeInt16LE(ref.type, 0);
  header.writeInt16LE(ref.variant, 2);
  parts.push(header);

  if (ref.type === 0x7fff || (ref.type & 1) === 0) {
    return;
  }

  if (!ref.object) return;

  // Write size placeholder — we'll need to calculate the actual size
  // For simplicity, we serialize the object first, then write its size
  const sizeIdx = parts.length;
  parts.push(Buffer.alloc(4)); // placeholder

  const startLen = totalLength(parts);
  writeSerializedObject(parts, doc, ref.object);
  const endLen = totalLength(parts);

  const size = endLen - startLen;
  parts[sizeIdx]!.writeUInt32LE(size, 0);
}

function writeSerializedObject(
  parts: Buffer[],
  doc: XfsDocument,
  obj: XfsSerializedObject,
): void {
  const classDef = doc.classes[obj.classIndex];
  if (!classDef) {
    throw new Error(`Class index ${obj.classIndex} out of range`);
  }

  for (let i = 0; i < classDef.propNum; i++) {
    const prop = classDef.properties[i]!;
    const field = obj.fields[i]!;

    const countBuf = Buffer.alloc(4);
    countBuf.writeInt32LE(field.count, 0);
    parts.push(countBuf);

    for (const val of field.values) {
      writeFieldValue(parts, doc, val, prop.type);
    }
  }
}

function writeFieldValue(
  parts: Buffer[],
  doc: XfsDocument,
  val: XfsFieldValue,
  type: DtiType,
): void {
  switch (type) {
    case DtiType.CLASS:
    case DtiType.CLASSREF: {
      writeClassRef(parts, doc, val.classRef ?? { type: 0x7fff, variant: 0 });
      break;
    }
    case DtiType.BOOL: {
      const buf = Buffer.alloc(1);
      buf.writeUInt8(val.value ? 1 : 0, 0);
      parts.push(buf);
      break;
    }
    case DtiType.U8: {
      const buf = Buffer.alloc(1);
      buf.writeUInt8(val.value as number, 0);
      parts.push(buf);
      break;
    }
    case DtiType.U16: {
      const buf = Buffer.alloc(2);
      buf.writeUInt16LE(val.value as number, 0);
      parts.push(buf);
      break;
    }
    case DtiType.U32: {
      const buf = Buffer.alloc(4);
      buf.writeUInt32LE(val.value as number, 0);
      parts.push(buf);
      break;
    }
    case DtiType.U64: {
      const buf = Buffer.alloc(8);
      buf.writeBigUInt64LE(BigInt(val.value as string), 0);
      parts.push(buf);
      break;
    }
    case DtiType.S8: {
      const buf = Buffer.alloc(1);
      buf.writeInt8(val.value as number, 0);
      parts.push(buf);
      break;
    }
    case DtiType.S16: {
      const buf = Buffer.alloc(2);
      buf.writeInt16LE(val.value as number, 0);
      parts.push(buf);
      break;
    }
    case DtiType.S32: {
      const buf = Buffer.alloc(4);
      buf.writeInt32LE(val.value as number, 0);
      parts.push(buf);
      break;
    }
    case DtiType.S64: {
      const buf = Buffer.alloc(8);
      buf.writeBigInt64LE(BigInt(val.value as string), 0);
      parts.push(buf);
      break;
    }
    case DtiType.F32: {
      const buf = Buffer.alloc(4);
      buf.writeFloatLE(val.value as number, 0);
      parts.push(buf);
      break;
    }
    case DtiType.F64: {
      const buf = Buffer.alloc(8);
      buf.writeDoubleLE(val.value as number, 0);
      parts.push(buf);
      break;
    }
    case DtiType.STRING:
    case DtiType.CSTRING: {
      const str = val.value as string;
      const strBuf = Buffer.from(str + '\0', 'utf-8');
      parts.push(strBuf);
      break;
    }
    case DtiType.VECTOR3: {
      const v = val.value as { x: number; y: number; z: number };
      const buf = Buffer.alloc(12);
      buf.writeFloatLE(v.x, 0);
      buf.writeFloatLE(v.y, 4);
      buf.writeFloatLE(v.z, 8);
      parts.push(buf);
      break;
    }
    case DtiType.VECTOR4:
    case DtiType.QUATERNION: {
      const v = val.value as { x: number; y: number; z: number; w: number };
      const buf = Buffer.alloc(16);
      buf.writeFloatLE(v.x, 0);
      buf.writeFloatLE(v.y, 4);
      buf.writeFloatLE(v.z, 8);
      buf.writeFloatLE(v.w, 12);
      parts.push(buf);
      break;
    }
    case DtiType.COLOR: {
      const c = val.value as { r: number; g: number; b: number; a: number };
      const buf = Buffer.alloc(4);
      buf.writeUInt8(c.r, 0);
      buf.writeUInt8(c.g, 1);
      buf.writeUInt8(c.b, 2);
      buf.writeUInt8(c.a, 3);
      parts.push(buf);
      break;
    }
    case DtiType.CUSTOM: {
      const strings = val.value as string[];
      const countBuf = Buffer.alloc(1);
      countBuf.writeUInt8(strings.length, 0);
      parts.push(countBuf);
      for (const str of strings) {
        parts.push(Buffer.from(str + '\0', 'utf-8'));
      }
      break;
    }
    default: {
      // Unknown type — write raw byte
      const raw = val._raw ?? '00';
      const buf = Buffer.alloc(1);
      buf.writeUInt8(parseInt(raw, 16), 0);
      parts.push(buf);
      break;
    }
  }
}

function totalLength(parts: Buffer[]): number {
  let len = 0;
  for (const p of parts) len += p.length;
  return len;
}

export { HEADER_SIZE as XFS_HEADER_SIZE, PROPERTY_SIZE as XFS_PROPERTY_SIZE };
