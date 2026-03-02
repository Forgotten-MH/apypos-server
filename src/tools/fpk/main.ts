import path from 'node:path';
import { unpackFpk, extractArcFile, xfsToJsonFile } from './commands/unpack.js';
import { repackFpk, repackArcFile, xfsFromJsonFile } from './commands/repack.js';

function printUsage(): void {
  console.log(`
FPK Tool — MHXR Archive Packer/Depacker

Usage:
  yarn fpk unpack <input.fpk> [-o DIR] [--no-xfs]
  yarn fpk repack <dir/> [-o FILE] [--plain-arc]
  yarn fpk arc-extract <input.arc> [-o DIR] [--no-xfs]
  yarn fpk arc-repack <dir/> [-o FILE] [--plain-arc]
  yarn fpk xfs-to-json <input.xfs> [-o FILE]
  yarn fpk xfs-from-json <input.json> [-o FILE]

Commands:
  unpack         Full pipeline: FPK → ARC → files (XFS → JSON)
  repack         Full pipeline: files → ARC → FPK
  arc-extract    Single ARC extraction
  arc-repack     Single ARC repacking
  xfs-to-json    Convert XFS binary to JSON
  xfs-from-json  Convert JSON back to XFS binary

Options:
  -o, --output   Output path (directory for unpack/extract, file for repack/convert)
  --no-xfs       Skip XFS → JSON conversion during extraction
  --plain-arc    Write unencrypted ARC files during repacking
`);
}

interface ParsedArgs {
  command: string;
  input: string;
  output?: string;
  noXfs: boolean;
  plainArc: boolean;
}

function parseArgs(argv: string[]): ParsedArgs | null {
  const args = argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    return null;
  }

  const command = args[0]!;
  const validCommands = ['unpack', 'repack', 'arc-extract', 'arc-repack', 'xfs-to-json', 'xfs-from-json'];
  if (!validCommands.includes(command)) {
    console.error(`Unknown command: ${command}`);
    printUsage();
    return null;
  }

  let input: string | undefined;
  let output: string | undefined;
  let noXfs = false;
  let plainArc = false;

  let i = 1;
  while (i < args.length) {
    const arg = args[i]!;
    switch (arg) {
      case '-o':
      case '--output':
        output = args[++i];
        break;
      case '--no-xfs':
        noXfs = true;
        break;
      case '--plain-arc':
        plainArc = true;
        break;
      default:
        if (!input) {
          input = arg;
        } else {
          console.error(`Unexpected argument: ${arg}`);
          printUsage();
          return null;
        }
    }
    i++;
  }

  if (!input) {
    console.error(`Missing input path for "${command}"`);
    printUsage();
    return null;
  }

  return { command, input, output, noXfs, plainArc };
}

function main(): void {
  const parsed = parseArgs(process.argv);
  if (!parsed) {
    process.exit(1);
  }

  const { command, input, output, noXfs, plainArc } = parsed;

  try {
    switch (command) {
      case 'unpack': {
        const outDir = output ?? path.join(path.dirname(input), path.basename(input, path.extname(input)));
        unpackFpk(input, { outputDir: outDir, noXfs });
        break;
      }
      case 'repack': {
        const outFile = output ?? input.replace(/\/?$/, '') + '.fpk';
        repackFpk(input, { outputFile: outFile, plainArc });
        break;
      }
      case 'arc-extract': {
        const outDir = output ?? path.join(path.dirname(input), path.basename(input, path.extname(input)));
        extractArcFile(input, { outputDir: outDir, noXfs });
        break;
      }
      case 'arc-repack': {
        const outFile = output ?? input.replace(/\/?$/, '') + '.arc';
        repackArcFile(input, { outputFile: outFile, plainArc });
        break;
      }
      case 'xfs-to-json': {
        xfsToJsonFile(input, output);
        break;
      }
      case 'xfs-from-json': {
        xfsFromJsonFile(input, output);
        break;
      }
    }
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

main();
