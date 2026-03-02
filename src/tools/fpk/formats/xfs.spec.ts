import { describe, it, expect } from 'vitest';
import { parseXfs, buildXfs, xfsToJson, jsonToXfs } from './xfs.js';
import { DtiType } from '../types.js';
import type { XfsDocument, XfsClassDef, XfsPropertyDef } from '../types.js';

function makePropertyDef(
  name: string,
  type: DtiType,
  nameOffset: number,
): XfsPropertyDef {
  return {
    nameOffset,
    name,
    type,
    attr: 0,
    bytes: 0,
    disabled: 0,
    _pad: Buffer.alloc(32),
  };
}

function makeTestDoc(
  properties: { name: string; type: DtiType }[],
  fieldValues: { count: number; values: { value?: unknown; classRef?: unknown; _raw?: string }[] }[],
): XfsDocument {
  // Build string table offsets
  let offset = 4; // after the 4-byte relOffset
  const props: XfsPropertyDef[] = [];
  for (const p of properties) {
    props.push(makePropertyDef(p.name, p.type, offset));
    offset += Buffer.byteLength(p.name, 'utf-8') + 1;
  }

  const classDef: XfsClassDef = {
    dtiHash: 0xaabbccdd,
    propNum: properties.length,
    _upper17: 0,
    properties: props,
  };

  return {
    header: {
      magic: 'XFS\0',
      version: 16,
      type: 0,
      classCount: 1n,
      defCount: 1,
      defSize: 0, // will be computed by buildXfs
    },
    classes: [classDef],
    root: {
      type: 1, // classIndex=0, odd
      variant: 0,
      size: 0,
      object: {
        classIndex: 0,
        fields: fieldValues,
      },
    },
  };
}

describe('XFS format', () => {
  it('should round-trip U32 field', () => {
    const doc = makeTestDoc(
      [{ name: 'count', type: DtiType.U32 }],
      [{ count: 1, values: [{ value: 42 }] }],
    );

    const buf = buildXfs(doc);
    const parsed = parseXfs(buf);

    expect(parsed.classes).toHaveLength(1);
    expect(parsed.classes[0]!.properties[0]!.name).toBe('count');
    expect(parsed.root.object!.fields[0]!.count).toBe(1);
    expect(parsed.root.object!.fields[0]!.values[0]!.value).toBe(42);
  });

  it('should round-trip S32 field', () => {
    const doc = makeTestDoc(
      [{ name: 'offset', type: DtiType.S32 }],
      [{ count: 1, values: [{ value: -100 }] }],
    );

    const buf = buildXfs(doc);
    const parsed = parseXfs(buf);
    expect(parsed.root.object!.fields[0]!.values[0]!.value).toBe(-100);
  });

  it('should round-trip BOOL field', () => {
    const doc = makeTestDoc(
      [{ name: 'enabled', type: DtiType.BOOL }],
      [{ count: 1, values: [{ value: true }] }],
    );

    const buf = buildXfs(doc);
    const parsed = parseXfs(buf);
    expect(parsed.root.object!.fields[0]!.values[0]!.value).toBe(true);
  });

  it('should round-trip F32 field', () => {
    const doc = makeTestDoc(
      [{ name: 'scale', type: DtiType.F32 }],
      [{ count: 1, values: [{ value: 1.5 }] }],
    );

    const buf = buildXfs(doc);
    const parsed = parseXfs(buf);
    expect(parsed.root.object!.fields[0]!.values[0]!.value).toBeCloseTo(1.5);
  });

  it('should round-trip U16 field', () => {
    const doc = makeTestDoc(
      [{ name: 'id', type: DtiType.U16 }],
      [{ count: 1, values: [{ value: 65535 }] }],
    );

    const buf = buildXfs(doc);
    const parsed = parseXfs(buf);
    expect(parsed.root.object!.fields[0]!.values[0]!.value).toBe(65535);
  });

  it('should round-trip STRING field', () => {
    const doc = makeTestDoc(
      [{ name: 'label', type: DtiType.STRING }],
      [{ count: 1, values: [{ value: 'hello' }] }],
    );

    const buf = buildXfs(doc);
    const parsed = parseXfs(buf);
    expect(parsed.root.object!.fields[0]!.values[0]!.value).toBe('hello');
  });

  it('should round-trip CUSTOM (string array) field', () => {
    const doc = makeTestDoc(
      [{ name: 'tags', type: DtiType.CUSTOM }],
      [{ count: 1, values: [{ value: ['alpha', 'beta'] }] }],
    );

    const buf = buildXfs(doc);
    const parsed = parseXfs(buf);
    expect(parsed.root.object!.fields[0]!.values[0]!.value).toEqual(['alpha', 'beta']);
  });

  it('should round-trip multiple fields', () => {
    const doc = makeTestDoc(
      [
        { name: 'id', type: DtiType.U32 },
        { name: 'name', type: DtiType.STRING },
        { name: 'active', type: DtiType.BOOL },
      ],
      [
        { count: 1, values: [{ value: 123 }] },
        { count: 1, values: [{ value: 'test' }] },
        { count: 1, values: [{ value: false }] },
      ],
    );

    const buf = buildXfs(doc);
    const parsed = parseXfs(buf);

    expect(parsed.root.object!.fields[0]!.values[0]!.value).toBe(123);
    expect(parsed.root.object!.fields[1]!.values[0]!.value).toBe('test');
    expect(parsed.root.object!.fields[2]!.values[0]!.value).toBe(false);
  });

  it('should round-trip array fields (count > 1)', () => {
    const doc = makeTestDoc(
      [{ name: 'values', type: DtiType.U32 }],
      [{ count: 3, values: [{ value: 10 }, { value: 20 }, { value: 30 }] }],
    );

    const buf = buildXfs(doc);
    const parsed = parseXfs(buf);
    expect(parsed.root.object!.fields[0]!.count).toBe(3);
    expect(parsed.root.object!.fields[0]!.values.map((v) => v.value)).toEqual([10, 20, 30]);
  });

  it('should round-trip empty fields (count = 0)', () => {
    const doc = makeTestDoc(
      [{ name: 'items', type: DtiType.U32 }],
      [{ count: 0, values: [] }],
    );

    const buf = buildXfs(doc);
    const parsed = parseXfs(buf);
    expect(parsed.root.object!.fields[0]!.count).toBe(0);
    expect(parsed.root.object!.fields[0]!.values).toEqual([]);
  });

  describe('JSON conversion', () => {
    it('should round-trip through JSON', () => {
      const doc = makeTestDoc(
        [
          { name: 'id', type: DtiType.U32 },
          { name: 'label', type: DtiType.STRING },
        ],
        [
          { count: 1, values: [{ value: 999 }] },
          { count: 1, values: [{ value: 'hello' }] },
        ],
      );

      const buf1 = buildXfs(doc);
      const parsed1 = parseXfs(buf1);
      const json = xfsToJson(parsed1);

      expect(json._format).toBe('xfs-v16');
      expect(json._classes).toHaveLength(1);

      const doc2 = jsonToXfs(json);
      const buf2 = buildXfs(doc2);
      const parsed2 = parseXfs(buf2);

      expect(parsed2.root.object!.fields[0]!.values[0]!.value).toBe(999);
      expect(parsed2.root.object!.fields[1]!.values[0]!.value).toBe('hello');
    });
  });

  describe('validation', () => {
    it('should reject invalid magic', () => {
      const buf = Buffer.alloc(24);
      buf.write('NOPE', 0, 4, 'ascii');
      expect(() => parseXfs(buf)).toThrow('Invalid XFS magic');
    });

    it('should reject unsupported version', () => {
      const buf = Buffer.alloc(24);
      buf.write('XFS\0', 0, 4, 'ascii');
      buf.writeUInt16LE(99, 4);
      expect(() => parseXfs(buf)).toThrow('Unsupported XFS version');
    });
  });
});
