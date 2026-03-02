import { Blowfish } from 'egoroof-blowfish';

const KEY_HEX = 'FFFFFFFF00000000FFFFFFFF000000006E7900002D5700004F3F2D5600000000';

export class EncryptionService {
  private readonly key = Buffer.from(KEY_HEX, 'hex');

  public encrypt(data: string): Buffer {
    const bf = new Blowfish(this.key, Blowfish.MODE.ECB, Blowfish.PADDING.PKCS5);
    return Buffer.from(bf.encode(data));
  }

  public decrypt(data: Buffer): string {
    const bf = new Blowfish(this.key, Blowfish.MODE.ECB, Blowfish.PADDING.PKCS5);
    return bf.decode(data, Blowfish.TYPE.STRING);
  }
}
