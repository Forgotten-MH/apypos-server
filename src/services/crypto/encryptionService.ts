import crypto from "crypto";

export class EncryptionService {
  // Hardcoded key
  private readonly keyHex =
    "FFFFFFFF00000000FFFFFFFF000000006E7900002D5700004F3F2D5600000000";

  constructor() {}

  public encrypt(data: string): Buffer {
    const cipher = crypto.createCipheriv(
      "BF-ECB",
      Buffer.from(this.keyHex, "hex"),
      null,
    );
    let crypted = cipher.update(data, "utf8", "hex");
    crypted += cipher.final("hex");
    return Buffer.from(crypted, "hex");
  }

  public decrypt(data: Buffer): string {
    const decipher = crypto.createDecipheriv(
      "bf-ecb",
      Buffer.from(this.keyHex, "hex"),
      null,
    );

    // Disable auto padding for the decipher object
    decipher.setAutoPadding(false);

    const decryptedBuffer = Buffer.concat([
      decipher.update(data),
      decipher.final(),
    ]);
    return decryptedBuffer.toString("utf8").replace(/\x00/g, ""); // remove null bytes
  }
}
