import fs from 'node:fs';
import path from 'node:path';
import { parseFpk } from '../formats/fpk.js';
import { parseArc } from '../formats/arc.js';
import { parseXfs, xfsToJson } from '../formats/xfs.js';
import { getExtension } from '../constants/arcExtensions.js';
import type { FpkManifest, FpkManifestEntry, ArcManifest, ArcManifestEntry } from '../types.js';

interface UnpackOptions {
  outputDir: string;
  noXfs?: boolean;
}

/**
 * Full pipeline: FPK → ARC → files (with optional XFS → JSON conversion)
 */
export function unpackFpk(inputPath: string, opts: UnpackOptions): void {
  const buf = fs.readFileSync(inputPath);
  const fpk = parseFpk(buf);

  const outDir = opts.outputDir;
  fs.mkdirSync(outDir, { recursive: true });

  const manifestEntries: FpkManifestEntry[] = [];

  for (const entry of fpk.entries) {
    // Each FPK entry is an ARC file
    const arcName = path.basename(entry.filePath).replace(/\.[^.]+$/, '') || entry.filePath;
    const arcDir = path.join(outDir, arcName);

    manifestEntries.push({
      filePath: entry.filePath,
      padding: entry.padding,
      size: entry.size,
      sizeAndFlags: entry.sizeAndFlags,
      arcDir: arcName,
    });

    // Extract the ARC
    extractArc(entry.data, arcDir, opts);
  }

  // Write FPK manifest
  const manifest: FpkManifest = {
    _format: 'fpk-manifest',
    header: fpk.header,
    entries: manifestEntries,
  };
  fs.writeFileSync(path.join(outDir, 'fpk.manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(`Unpacked ${fpk.entries.length} ARC(s) to ${outDir}`);
}

/**
 * Extract a single ARC file to a directory.
 */
export function extractArcFile(inputPath: string, opts: UnpackOptions): void {
  const buf = fs.readFileSync(inputPath);
  extractArc(buf, opts.outputDir, opts);
  console.log(`Extracted ARC to ${opts.outputDir}`);
}

function extractArc(buf: Buffer, outDir: string, opts: UnpackOptions): void {
  const arc = parseArc(buf);

  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(path.join(outDir, 'data'), { recursive: true });

  const manifestEntries: ArcManifestEntry[] = [];

  for (const entry of arc.entries) {
    const ext = getExtension(entry.extHash);
    const fileName = entry.name + ext;
    const filePath = path.join(outDir, 'data', fileName);

    // Create subdirectories if needed
    const dirName = path.dirname(filePath);
    fs.mkdirSync(dirName, { recursive: true });

    // Check if this is an XFS file and convert to JSON if requested
    const isXfs =
      !opts.noXfs &&
      entry.data.length >= 6 &&
      entry.data.toString('ascii', 0, 4) === 'XFS\0';

    let outputFileName: string;
    if (isXfs) {
      try {
        const xfsDoc = parseXfs(entry.data);
        const json = xfsToJson(xfsDoc);
        const jsonPath = filePath + '.json';
        fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2));
        outputFileName = fileName + '.json';
      } catch (err) {
        // Fall back to raw binary if XFS parsing fails
        console.warn(`  Warning: failed to parse XFS "${fileName}", saving as binary: ${err instanceof Error ? err.message : String(err)}`);
        fs.writeFileSync(filePath, entry.data);
        outputFileName = fileName;
      }
    } else {
      fs.writeFileSync(filePath, entry.data);
      outputFileName = fileName;
    }

    manifestEntries.push({
      name: entry.name,
      extHash: entry.extHash,
      extension: ext,
      decompSizeRaw: entry.decompSize,
      fileName: outputFileName,
    });
  }

  const manifest: ArcManifest = {
    _format: 'arc-manifest',
    header: arc.header,
    encrypted: arc.encrypted,
    entries: manifestEntries,
  };
  fs.writeFileSync(path.join(outDir, 'arc.manifest.json'), JSON.stringify(manifest, null, 2));
}

/**
 * Convert a single XFS binary file to JSON.
 */
export function xfsToJsonFile(inputPath: string, outputPath?: string): void {
  const buf = fs.readFileSync(inputPath);
  const doc = parseXfs(buf);
  const json = xfsToJson(doc);
  const out = outputPath ?? inputPath + '.json';
  fs.writeFileSync(out, JSON.stringify(json, null, 2));
  console.log(`Converted XFS to JSON: ${out}`);
}
