import fs from 'node:fs';
import path from 'node:path';
import { buildFpk, type BuildFpkInput } from '../formats/fpk.js';
import { buildArc, type BuildArcInput } from '../formats/arc.js';
import { jsonToXfs, buildXfs } from '../formats/xfs.js';
import type { FpkManifest, ArcManifest, XfsJson } from '../types.js';

interface RepackOptions {
  outputFile: string;
  plainArc?: boolean;
}

/**
 * Full pipeline: directory → ARC → FPK
 */
export function repackFpk(inputDir: string, opts: RepackOptions): void {
  const manifestPath = path.join(inputDir, 'fpk.manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Missing fpk.manifest.json in ${inputDir}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as FpkManifest;
  const fpkInputs: BuildFpkInput[] = [];

  for (const entry of manifest.entries) {
    const arcDir = path.join(inputDir, entry.arcDir);
    const arcData = buildArcFromDir(arcDir, opts);
    fpkInputs.push({
      filePath: entry.filePath,
      data: arcData,
    });
  }

  const fpkBuffers = buildFpk(fpkInputs, {
    compression: manifest.header.compression,
  });

  for (let i = 0; i < fpkBuffers.length; i++) {
    const outPath =
      fpkBuffers.length === 1
        ? opts.outputFile
        : opts.outputFile.replace(/\.fpk$/i, `.${String(i).padStart(2, '0')}.fpk`);
    fs.writeFileSync(outPath, fpkBuffers[i]!);
    console.log(`Written FPK: ${outPath}`);
  }
}

/**
 * Repack a single ARC directory.
 */
export function repackArcFile(inputDir: string, opts: RepackOptions): void {
  const arcData = buildArcFromDir(inputDir, opts);
  fs.writeFileSync(opts.outputFile, arcData);
  console.log(`Written ARC: ${opts.outputFile}`);
}

function buildArcFromDir(arcDir: string, opts: RepackOptions): Buffer {
  const manifestPath = path.join(arcDir, 'arc.manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Missing arc.manifest.json in ${arcDir}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as ArcManifest;
  const encrypted = opts.plainArc ? false : manifest.encrypted;

  const arcInputs: BuildArcInput[] = [];

  for (const entry of manifest.entries) {
    const filePath = path.join(arcDir, 'data', entry.fileName);

    let data: Buffer;
    if (entry.fileName.endsWith('.xfs.json')) {
      // Convert JSON back to XFS binary
      const json = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as XfsJson;
      const doc = jsonToXfs(json);
      data = buildXfs(doc);
    } else {
      data = fs.readFileSync(filePath);
    }

    arcInputs.push({
      name: entry.name,
      extHash: entry.extHash,
      data,
    });
  }

  return buildArc(arcInputs, encrypted);
}

/**
 * Convert a single JSON file back to XFS binary.
 */
export function xfsFromJsonFile(inputPath: string, outputPath?: string): void {
  const json = JSON.parse(fs.readFileSync(inputPath, 'utf-8')) as XfsJson;
  const doc = jsonToXfs(json);
  const buf = buildXfs(doc);
  const out = outputPath ?? inputPath.replace(/\.json$/, '');
  fs.writeFileSync(out, buf);
  console.log(`Converted JSON to XFS: ${out}`);
}
