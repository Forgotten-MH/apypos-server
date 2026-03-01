import * as fs from 'fs';
import * as path from 'path';
import crcjam from 'crc/crcjam';
import { createLogger } from '../middleware/logger';
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
    const data: { filePath: string; crc: string; fileSize: number }[] = [];

    walkDir(folderPath + os + '/' + type, (filePath) => {
      if (path.extname(filePath) === '.fpk') {
        log.debug('Processing File:', filePath);
        const fileData = fs.readFileSync(filePath);
        const fileSize = fs.statSync(filePath).size;

        const jam = crcjam(fileData).toString(16);

        let parsedPath = filePath.replace(/\\/g, '/');
        parsedPath = parsedPath.replace(path.posix.join('public', 'res', 'download', os), '');
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
