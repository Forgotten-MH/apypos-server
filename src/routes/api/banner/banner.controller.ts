import { fileURLToPath } from 'node:url';
import { Request, Response } from 'express';
import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { createLogger } from '../../../middleware/logger.js';
import { promises as fs } from 'fs';
import path from 'path';
import type { BannerDlListInput } from './banner.schema.js';

const __dirname = import.meta.dirname ?? fileURLToPath(new URL('.', import.meta.url));
import crcjam from 'crc/crcjam';
const log = createLogger('banner');

const readFilesFromDir = async (
  dir: string,
  data: { download_list: { hash: number; path: string; size: number }[] },
) => {
  try {
    const files = await fs.readdir(dir);

    // Iterate over the files and push an object for each into the download_list
    for (const file of files) {
      if (path.extname(file) === '.fpk') {
        const filePath = path.join(dir, file);
        const fileStats = await fs.stat(filePath); // Use promises API for file stats
        const jam = crcjam(file);

        data.download_list.push({
          hash: jam, // Hash calculated based on file name or content
          path: `/${file}`, // Adjust if directory info is needed in the path
          size: fileStats.size, // Size of the file in bytes
        });
      }
    }
  } catch (err) {
    log.error('Error reading files from directory:', err);
    // Don't throw - return empty list if directory doesn't exist
  }
};

export const getDlList = async (req: Request, res: Response) => {
  const data = {
    download_list: [],
  };

  try {
    const { device_id } = req.body as BannerDlListInput;
    switch (device_id) {
      case 2:
        await readFilesFromDir(
          path.join(__dirname, '..', '..', '..', 'public', 'res', 'banner', 'android'),
          data,
        );
        break;
      case 3:
        await readFilesFromDir(
          path.join(__dirname, '..', '..', '..', 'public', 'res', 'banner', 'ios'),
          data,
        );
        break;
      default:
        res.status(400).send('Bad Request');
        return;
    }

    encryptAndSend(data, res, req);
  } catch (_error) {
    // Return empty download list if banner directory is missing
    encryptAndSend(data, res, req);
  }
};
