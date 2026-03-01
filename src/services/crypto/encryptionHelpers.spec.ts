import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearAllSessions,
  decryptAndParse,
  getSessionCount,
  getAllActiveSessions,
  getSessionStats,
  getPerformanceStats,
  verifySessionToken,
  generateUniqueId,
  findSessionsByUser,
} from './encryptionHelpers';
import { EncryptionService } from './encryptionService';

describe('encryptionHelpers - session management', () => {
  beforeEach(() => {
    clearAllSessions();
  });

  it('clearAllSessions resets count to 0', () => {
    expect(getSessionCount()).toBe(0);
  });

  it('getAllActiveSessions returns empty array after clear', () => {
    expect(getAllActiveSessions()).toEqual([]);
  });

  it('getSessionStats returns correct structure', () => {
    const stats = getSessionStats();
    expect(stats).toHaveProperty('total', 0);
    expect(stats).toHaveProperty('byType');
    expect(stats).toHaveProperty('lastCleanup');
    expect(stats).toHaveProperty('cleanupInterval');
  });

  it('getPerformanceStats returns correct structure', () => {
    const stats = getPerformanceStats();
    expect(stats).toHaveProperty('sessionCount', 0);
    expect(stats).toHaveProperty('lastCleanupTime');
    expect(stats).toHaveProperty('timeSinceLastCleanup');
    expect(stats).toHaveProperty('shouldCleanup');
  });

  it('verifySessionToken returns false for nonexistent user', () => {
    expect(verifySessionToken('nonexistent', 'token')).toBe(false);
  });

  it('generateUniqueId returns a UUID string', () => {
    const id = generateUniqueId();
    expect(typeof id).toBe('string');
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('generateUniqueId returns unique values', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateUniqueId()));
    expect(ids.size).toBe(100);
  });

  it('findSessionsByUser returns empty for unknown user', () => {
    expect(findSessionsByUser('unknown', 'account')).toEqual([]);
    expect(findSessionsByUser('unknown', 'game')).toEqual([]);
    expect(findSessionsByUser('unknown', 'session')).toEqual([]);
  });
});

describe('decryptAndParse', () => {
  const encryptionService = new EncryptionService();

  it('decrypts and parses a valid encrypted JSON payload', () => {
    const original = { user_id: 'test123', action: 'login' };
    const encrypted = encryptionService.encrypt(JSON.stringify(original));
    const result = decryptAndParse(encrypted);
    expect(result).toEqual(original);
  });

  it('throws on random (non-encrypted) data', () => {
    const garbage = Buffer.from('this is not encrypted data!!!!!!!');
    expect(() => decryptAndParse(garbage)).toThrow();
  });

  it('throws on empty buffer', () => {
    expect(() => decryptAndParse(Buffer.alloc(0))).toThrow();
  });
});
