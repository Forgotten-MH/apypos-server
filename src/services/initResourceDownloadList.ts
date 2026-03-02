import { fileURLToPath } from 'node:url';
import * as fs from 'fs';
import * as path from 'path';

const __dirname = import.meta.dirname ?? fileURLToPath(new URL('.', import.meta.url));
import crcjam from 'crc/crcjam';
import { createLogger } from '../middleware/logger.js';
const log = createLogger('initResourceDownload');

const folderPath = path.join(__dirname, '../public/res/download/');

function walkDir(dir: string, fileCallback: (filePath: string) => void) {
  fs.readdirSync(dir).forEach((item) => {
    const itemPath = path.join(dir, item);
    const isDirectory = fs.statSync(itemPath).isDirectory();

    if (isDirectory) {
      // Recursively traverse subdirectories
      walkDir(itemPath, fileCallback);
    } else {
      fileCallback(itemPath);
    }
  });
}

export function makeDownloadList(type: string, os: string) {
  if (!fs.existsSync(folderPath + os + '/' + type + '/download.list')) {
    const targetDir = folderPath + os + '/' + type;
    if (!fs.existsSync(targetDir)) {
      log.warn(`Resource directory missing: ${targetDir} — writing empty download.list. Run 'yarn setup' to create the directory structure.`);
      fs.mkdirSync(targetDir, { recursive: true });
      fs.writeFileSync(path.join(targetDir, 'download.list'), '');
      return;
    }

    const data: { filePath: string; crc: number; fileSize: number }[] = [];

    walkDir(targetDir, (filePath) => {
      if (path.extname(filePath) === '.fpk') {
        log.debug('Processing File:', filePath);
        const fileData = fs.readFileSync(filePath);
        const fileSize = fs.statSync(filePath).size;

        const jam = crcjam(fileData);

        let parsedPath = filePath.replace(/\\/g, '/');
        // Strip everything up to and including the OS download directory
        // e.g., .../res/download/android/tutorialDL/adrd/sound.01.fpk → /tutorialDL/adrd/sound.01.fpk
        const osDir = '/res/download/' + os;
        const osIndex = parsedPath.indexOf(osDir);
        if (osIndex !== -1) {
          parsedPath = parsedPath.substring(osIndex + osDir.length);
        }
        parsedPath = parsedPath.replace('/v0282', '');

        data.push({ filePath: parsedPath, crc: jam, fileSize });
      }
    });
    let response = '';
    data.forEach((item, index) => {
      response += `${item.filePath},${item.crc},${item.fileSize}`;
      if (index < data.length - 1) {
        response += '\n';
      }
    });
    log.debug(response);

    fs.writeFile(folderPath + os + '/' + type + '/download.list', response, (err) => {
      if (err) {
        log.error('Error creating the file:', err);
      } else {
        log.info('File created successfully.');
      }
    });
  } else {
    log.info(folderPath + os + '/' + type + '/download.list' + ' Already exists');
  }
}
