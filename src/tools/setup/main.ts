import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT_DIR = path.resolve(import.meta.dirname, '..', '..', '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const RES_DIR = path.join(SRC_DIR, 'public', 'res');
const DOWNLOAD_DIR = path.join(RES_DIR, 'download');

const PLATFORMS = ['android', 'ios'] as const;
const DOWNLOAD_CATEGORIES = ['openingDL', 'tutorialDL', 'trainingDL', 'v0282/stdDL'] as const;

function printUsage(): void {
  console.log(`
Apypos Setup — Create resource directories and configure environment

Usage:
  yarn setup                              Create dirs + .env (server starts cleanly)
  yarn setup --import-resources <path>    Also symlink FPK files from a local path

Options:
  --import-resources <path>   Path to a resource dump directory containing
                              android/ and/or ios/ subdirectories
  -h, --help                  Show this help message
`);
}

interface ParsedArgs {
  importPath?: string;
}

function parseArgs(argv: string[]): ParsedArgs | null {
  const args = argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    return null;
  }

  let importPath: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--import-resources') {
      importPath = args[++i];
      if (!importPath) {
        console.error('Error: --import-resources requires a path argument');
        printUsage();
        return null;
      }
    } else {
      console.error(`Unexpected argument: ${args[i]}`);
      printUsage();
      return null;
    }
  }

  return { importPath };
}

function createEnvFile(): boolean {
  const envPath = path.join(ROOT_DIR, '.env');
  const examplePath = path.join(ROOT_DIR, '.env.example');

  if (fs.existsSync(envPath)) {
    console.log('  .env already exists, skipping');
    return false;
  }

  if (!fs.existsSync(examplePath)) {
    console.warn('  .env.example not found, skipping .env creation');
    return false;
  }

  fs.copyFileSync(examplePath, envPath);
  console.log('  Created .env from .env.example');
  return true;
}

function createDirectoryTree(): number {
  let created = 0;

  for (const platform of PLATFORMS) {
    // Banner directories
    const bannerDir = path.join(RES_DIR, 'banner', platform);
    if (!fs.existsSync(bannerDir)) {
      fs.mkdirSync(bannerDir, { recursive: true });
      created++;
    }

    // Download category directories with subdirectories
    for (const category of DOWNLOAD_CATEGORIES) {
      for (const sub of ['adrd', 'cmn']) {
        const dir = path.join(DOWNLOAD_DIR, platform, category, sub);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          created++;
        }
      }
    }
  }

  console.log(`  Created ${created} directories under src/public/res/`);
  return created;
}

function createEmptyDownloadLists(): number {
  let created = 0;

  for (const platform of PLATFORMS) {
    for (const category of DOWNLOAD_CATEGORIES) {
      const listPath = path.join(DOWNLOAD_DIR, platform, category, 'download.list');
      if (!fs.existsSync(listPath)) {
        fs.writeFileSync(listPath, '');
        created++;
      }
    }
  }

  console.log(`  Created ${created} empty download.list files`);
  return created;
}

function importResources(sourcePath: string): void {
  const resolvedSource = path.resolve(sourcePath);

  if (!fs.existsSync(resolvedSource)) {
    console.error(`Error: Source path does not exist: ${resolvedSource}`);
    process.exit(1);
  }

  if (!fs.statSync(resolvedSource).isDirectory()) {
    console.error(`Error: Source path is not a directory: ${resolvedSource}`);
    process.exit(1);
  }

  let linked = 0;

  for (const platform of PLATFORMS) {
    const platformSource = path.join(resolvedSource, platform);
    if (!fs.existsSync(platformSource)) {
      console.log(`  Skipping ${platform}/ (not found in source)`);
      continue;
    }

    const platformTarget = path.join(DOWNLOAD_DIR, platform);

    // Remove the empty directory tree we created and replace with symlink
    if (fs.existsSync(platformTarget)) {
      fs.rmSync(platformTarget, { recursive: true });
    }
    fs.symlinkSync(platformSource, platformTarget, 'dir');
    console.log(`  Linked ${platform}/ → ${platformSource}`);
    linked++;
  }

  if (linked === 0) {
    console.warn('  Warning: No android/ or ios/ subdirectories found in source path');
    console.warn(`  Expected structure: ${resolvedSource}/android/ and/or ${resolvedSource}/ios/`);
    return;
  }

  // Remove empty download.list files so the server regenerates them with real CRCs
  let removed = 0;
  for (const platform of PLATFORMS) {
    for (const category of DOWNLOAD_CATEGORIES) {
      const listPath = path.join(DOWNLOAD_DIR, platform, category, 'download.list');
      if (fs.existsSync(listPath)) {
        const content = fs.readFileSync(listPath, 'utf-8');
        if (content.length === 0) {
          fs.unlinkSync(listPath);
          removed++;
        }
      }
    }
  }

  if (removed > 0) {
    console.log(`  Removed ${removed} empty download.list files (server will regenerate with real CRCs)`);
  }
}

function main(): void {
  const parsed = parseArgs(process.argv);
  if (!parsed) {
    process.exit(1);
  }

  console.log('\nApypos Server Setup\n');

  console.log('1. Environment file');
  createEnvFile();

  console.log('\n2. Resource directories');
  createDirectoryTree();

  console.log('\n3. Download lists');
  createEmptyDownloadLists();

  if (parsed.importPath) {
    console.log('\n4. Importing resources');
    importResources(parsed.importPath);
  }

  console.log('\n--- Setup complete ---\n');

  if (!parsed.importPath) {
    console.log('The server will start without game resources.');
    console.log('To import FPK files later, run:');
    console.log('  yarn setup --import-resources /path/to/res/download\n');
  }

  console.log('Next steps:');
  console.log('  1. Edit .env with your network settings (IP, MongoDB, etc.)');
  console.log('  2. Start MongoDB (or run: docker-compose up -d mongo)');
  console.log('  3. Run: yarn dev\n');
}

main();
