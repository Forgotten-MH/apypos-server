import crypto from "crypto";
import fs from "fs";

const key = "FFFFFFFF00000000FFFFFFFF000000006E7900002D5700004F3F2D5600000000";
const cacheKey = "K@HW`wQ=O_fAHSoy/bV"


const fileBuffer = fs.readFileSync(".\\Caches\\cache");

// Convert binary to hex string
const hexData = fileBuffer.toString("hex");
const encryptedData = Buffer.from(hexData, "hex");

function decrypt(data: Buffer): Buffer {
  const keyBuf = Buffer.from(cacheKey, "ascii"); // Use raw ASCII bytes

  const decipher = crypto.createDecipheriv(
    "bf-ecb",
    keyBuf,
    null,
  );

  decipher.setAutoPadding(false);

  const decryptedBuffer = Buffer.concat([
    decipher.update(data),
    decipher.final(),
  ]);

  return decryptedBuffer; // or "utf8" if it should be readable text
}
const decryptedBuffer = decrypt(encryptedData);

fs.writeFileSync(".\\Caches\\decrypted.bin", decryptedBuffer);
console.log(decryptedBuffer);
