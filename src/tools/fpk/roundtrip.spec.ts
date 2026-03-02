import { describe, it, expect } from 'vitest';
import { buildFpk, parseFpk } from './formats/fpk.js';
import { buildArc, parseArc } from './formats/arc.js';
import { buildXfs, parseXfs, xfsToJson, jsonToXfs } from './formats/xfs.js';
import { DtiType } from './types.js';
import type { XfsDocument, XfsClassDef, XfsPropertyDef } from './types.js';

function makeSimpleXfsDoc(): XfsDocument {
  const props: XfsPropertyDef[] = [
    {
      nameOffset: 4,
      name: 'questId',
      type: DtiType.U32,
      attr: 0,
      bytes: 0,
      disabled: 0,
      _pad: Buffer.alloc(32),
    },
    {
      nameOffset: 12,
      name: 'name',
      type: DtiType.STRING,
      attr: 0,
      bytes: 0,
      disabled: 0,
      _pad: Buffer.alloc(32),
    },
  ];

  const classDef: XfsClassDef = {
    dtiHash: 0x11223344,
    propNum: 2,
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
      defSize: 0,
    },
    classes: [classDef],
    root: {
      type: 1,
      variant: 0,
      size: 0,
      object: {
        classIndex: 0,
        fields: [
          { count: 1, values: [{ value: 42 }] },
          { count: 1, values: [{ value: 'TestQuest' }] },
        ],
      },
    },
  };
}

describe('Full round-trip integration', () => {
  it('should round-trip: build XFS → build ARC → build FPK → parse FPK → parse ARC → parse XFS', () => {
    // Step 1: Build a synthetic XFS document
    const xfsDoc = makeSimpleXfsDoc();
    const xfsBuf = buildXfs(xfsDoc);

    // Step 2: Pack it into a plain ARC
    const arcInputs = [
      { name: 'data/quest', extHash: 0xaabb, data: xfsBuf },
    ];
    const arcBuf = buildArc(arcInputs, false);

    // Step 3: Pack ARC into FPK
    const fpkInputs = [{ filePath: 'quest/quest.arc', data: arcBuf }];
    const [fpkBuf] = buildFpk(fpkInputs);
    expect(fpkBuf).toBeDefined();

    // Step 4: Parse FPK back
    const fpk = parseFpk(fpkBuf!);
    expect(fpk.entries).toHaveLength(1);
    expect(fpk.entries[0]!.filePath).toBe('quest/quest.arc');

    // Step 5: Parse ARC from FPK entry
    const arc = parseArc(fpk.entries[0]!.data);
    expect(arc.entries).toHaveLength(1);
    expect(arc.entries[0]!.name).toBe('data/quest');

    // Step 6: Parse XFS from ARC entry
    const xfsParsed = parseXfs(arc.entries[0]!.data);
    expect(xfsParsed.classes).toHaveLength(1);
    expect(xfsParsed.root.object!.fields[0]!.values[0]!.value).toBe(42);
    expect(xfsParsed.root.object!.fields[1]!.values[0]!.value).toBe('TestQuest');
  });

  it('should round-trip with ARCC encryption', () => {
    const xfsDoc = makeSimpleXfsDoc();
    const xfsBuf = buildXfs(xfsDoc);

    const arcInputs = [
      { name: 'data/quest', extHash: 0xaabb, data: xfsBuf },
      { name: 'se/ambient', extHash: 0xccdd, data: Buffer.from('sound-data-bytes') },
    ];
    const arcBuf = buildArc(arcInputs, true);
    expect(arcBuf.toString('ascii', 0, 4)).toBe('ARCC');

    const fpkInputs = [{ filePath: 'quest/quest.arc', data: arcBuf }];
    const [fpkBuf] = buildFpk(fpkInputs);

    const fpk = parseFpk(fpkBuf!);
    const arc = parseArc(fpk.entries[0]!.data);
    expect(arc.encrypted).toBe(true);
    expect(arc.entries).toHaveLength(2);

    const xfsParsed = parseXfs(arc.entries[0]!.data);
    expect(xfsParsed.root.object!.fields[0]!.values[0]!.value).toBe(42);

    expect(arc.entries[1]!.data.toString()).toBe('sound-data-bytes');
  });

  it('should round-trip XFS through JSON and back to identical binary', () => {
    const xfsDoc = makeSimpleXfsDoc();
    const buf1 = buildXfs(xfsDoc);

    // Parse → JSON → back to doc → build
    const parsed = parseXfs(buf1);
    const json = xfsToJson(parsed);
    const doc2 = jsonToXfs(json);
    const buf2 = buildXfs(doc2);

    // Parse both and compare semantically
    const parsed2 = parseXfs(buf2);
    expect(parsed2.root.object!.fields[0]!.values[0]!.value).toBe(
      parsed.root.object!.fields[0]!.values[0]!.value,
    );
    expect(parsed2.root.object!.fields[1]!.values[0]!.value).toBe(
      parsed.root.object!.fields[1]!.values[0]!.value,
    );
  });

  it('should handle FPK with multiple ARCs containing multiple files', () => {
    const arc1 = buildArc(
      [
        { name: 'a/file1', extHash: 0x01, data: Buffer.from('data1') },
        { name: 'a/file2', extHash: 0x02, data: Buffer.from('data2') },
      ],
      false,
    );

    const arc2 = buildArc(
      [
        { name: 'b/file3', extHash: 0x03, data: Buffer.from('data3') },
      ],
      true,
    );

    const [fpkBuf] = buildFpk([
      { filePath: 'pack/a.arc', data: arc1 },
      { filePath: 'pack/b.arc', data: arc2 },
    ]);

    const fpk = parseFpk(fpkBuf!);
    expect(fpk.entries).toHaveLength(2);

    const parsedArc1 = parseArc(fpk.entries[0]!.data);
    expect(parsedArc1.entries).toHaveLength(2);
    expect(parsedArc1.entries[0]!.data.toString()).toBe('data1');
    expect(parsedArc1.entries[1]!.data.toString()).toBe('data2');

    const parsedArc2 = parseArc(fpk.entries[1]!.data);
    expect(parsedArc2.entries).toHaveLength(1);
    expect(parsedArc2.entries[0]!.data.toString()).toBe('data3');
  });
});
