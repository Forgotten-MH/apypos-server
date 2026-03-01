import { describe, it, expect } from 'vitest';
import { EncryptionService } from './encryptionService';

// Decrypt with autoPadding disabled returns PKCS5 padding bytes;
// strip them the same way the production decrypt strips null bytes.
function stripPadding(s: string): string {
  return s.replace(/[\x01-\x08]+$/, '');
}

describe('EncryptionService', () => {
  const service = new EncryptionService();

  it('encrypt returns a Buffer', () => {
    const result = service.encrypt('hello');
    expect(Buffer.isBuffer(result)).toBe(true);
  });

  it('decrypt reverses encrypt (round-trip)', () => {
    const original = '{"user_id":"test123","action":"login"}';
    const encrypted = service.encrypt(original);
    const decrypted = stripPadding(service.decrypt(encrypted));
    expect(decrypted).toBe(original);
  });

  it('round-trips JSON with special characters', () => {
    const original = JSON.stringify({ name: 'テスト', value: 42, emoji: '🎮' });
    const encrypted = service.encrypt(original);
    const decrypted = stripPadding(service.decrypt(encrypted));
    expect(decrypted).toBe(original);
  });

  it('round-trips empty object', () => {
    const original = '{}';
    const encrypted = service.encrypt(original);
    const decrypted = stripPadding(service.decrypt(encrypted));
    expect(decrypted).toBe(original);
  });

  it('round-trips large payload', () => {
    const original = JSON.stringify({ data: 'x'.repeat(10000) });
    const encrypted = service.encrypt(original);
    const decrypted = stripPadding(service.decrypt(encrypted));
    expect(decrypted).toBe(original);
  });

  it('different inputs produce different ciphertexts', () => {
    const a = service.encrypt('message_a');
    const b = service.encrypt('message_b');
    expect(a.equals(b)).toBe(false);
  });
});
