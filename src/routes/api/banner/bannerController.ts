import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";
import { promises as fs } from "fs";
import path from "path";
import crcjam from "crc/crcjam";

const readFilesFromDir = async (dir, data) => {
  try {
    const files = await fs.readdir(dir);
    
    // Iterate over the files and push an object for each into the download_list
    for (const file of files) {
      if (path.extname(file) === ".fpk") {
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
    console.error("Error reading files from directory:", err);
    throw err; // Optionally rethrow the error
  }
};

export const getDlList = async (req, res) => {
  let data = {
    download_list: [],
  };

  try {
    switch (req.body.device_id) {
      case 2:
        await readFilesFromDir(
          path.join(__dirname, "..", "..","..", "public", "res", "banner", "android"),
          data
        );
        break;
      case 3:
        await readFilesFromDir(
          path.join(__dirname, "..","..","..", "public", "res", "banner", "ios"),
          data
        );
        break;
      default:
        return res.status(400);
    }

    encryptAndSend(data, res, req);
  } catch (error) {
    res
      .status(500);
  }
};
