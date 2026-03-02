import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../model/session', () => ({
  default: {
    updateOne: vi.fn().mockResolvedValue({}),
    deleteOne: vi.fn().mockResolvedValue({}),
    deleteMany: vi.fn().mockResolvedValue({}),
    find: vi.fn().mockResolvedValue([]),
  },
}));

import {
  clearAllSessions,
  decryptAndParse,
  encryptAndSend,
  getSessionCount,
  getAllActiveSessions,
  getSessionStats,
  getPerformanceStats,
  verifySessionToken,
  generateUniqueId,
  findSessionsByUser,
  getSessionInfo,
} from './encryptionHelpers.js';
import { EncryptionService } from './encryptionService.js';
import type { Response, Request } from 'express';

function makeReq(overrides: Record<string, unknown> = {}): Request {
  return {
    body: {},
    query: {},
    ip: '127.0.0.1',
    socket: { remoteAddress: '127.0.0.1' },
    get: (header: string) => (header === 'User-Agent' ? 'TestAgent/1.0' : undefined),
    ...overrides,
  } as unknown as Request;
}

function makeRes(): Response & { _status: number; _data: Buffer | null; _headers: Record<string, string> } {
  const res = {
    _status: 0,
    _data: null as Buffer | null,
    _headers: {} as Record<string, string>,
    status(code: number) {
      res._status = code;
      return res;
    },
    header(name: string, value: string) {
      res._headers[name] = value;
      return res;
    },
    send(data: Buffer) {
      res._data = data;
      return res;
    },
  };
  return res as unknown as Response & { _status: number; _data: Buffer | null; _headers: Record<string, string> };
}

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

describe('encryptAndSend', () => {
  const encryptionService = new EncryptionService();

  beforeEach(() => {
    clearAllSessions();
  });

  it('sends encrypted response with correct status and content type', () => {
    const req = makeReq({ body: { user_id: 'u1' } });
    const res = makeRes();

    encryptAndSend({ result: 'ok' }, res, req);

    expect(res._status).toBe(200);
    expect(res._headers['Content-Type']).toBe('application/octet-stream');
    expect(res._data).toBeInstanceOf(Buffer);
  });

  it('response decrypts to valid JSON with protocol fields', () => {
    const req = makeReq({ body: { user_id: 'u1' } });
    const res = makeRes();

    encryptAndSend({ result: 'ok' }, res, req);

    const decrypted = JSON.parse(
      encryptionService.decrypt(res._data!).replace(/\0+$/, '').trim(),
    ) as Record<string, unknown>;
    expect(decrypted.result).toBe('ok');
    expect(decrypted.res_ver).toBe(282);
    expect(decrypted.banner_ver).toBe(91);
    expect(decrypted.app_ver).toBe('09.03.06');
    expect(decrypted.session_id).toEqual(expect.any(String));
    expect(decrypted.error_code).toBe(0);
    expect(decrypted.now_time).toEqual(expect.any(Number));
  });

  it('includes custom error codes in response', () => {
    const req = makeReq({ body: { user_id: 'u1' } });
    const res = makeRes();

    encryptAndSend({}, res, req, 4004, 2, 'not_auth');

    const decrypted = JSON.parse(
      encryptionService.decrypt(res._data!).replace(/\0+$/, '').trim(),
    ) as Record<string, unknown>;
    expect(decrypted.error_code).toBe(4004);
    expect(decrypted.error_category).toBe(2);
    expect(decrypted.error_detail).toBe('not_auth');
  });

  it('sends with custom status code', () => {
    const req = makeReq({ body: { user_id: 'u1' } });
    const res = makeRes();

    encryptAndSend({}, res, req, 0, 0, '', 400);

    expect(res._status).toBe(400);
  });

  it('creates session for userId path', () => {
    const req = makeReq({ body: { user_id: 'user-42' } });
    const res = makeRes();

    encryptAndSend({}, res, req);

    const session = getSessionInfo('user_user-42');
    expect(session).toBeDefined();
    expect(session!.account_id).toBe('user-42');
  });

  it('reuses existing session for same userId', () => {
    const req = makeReq({ body: { user_id: 'user-42' } });
    const res1 = makeRes();
    const res2 = makeRes();

    encryptAndSend({}, res1, req);
    const firstSession = getSessionInfo('user_user-42');
    const firstToken = firstSession!.session_token;

    encryptAndSend({}, res2, req);
    const secondSession = getSessionInfo('user_user-42');
    expect(secondSession!.session_token).toBe(firstToken);
  });

  it('creates session for clientSessionToken path (session_id in body)', () => {
    const req = makeReq({ body: { session_id: 'client-tok-1' } });
    const res = makeRes();

    encryptAndSend({}, res, req);

    // Should create a session keyed by client token
    const decrypted = JSON.parse(
      encryptionService.decrypt(res._data!).replace(/\0+$/, '').trim(),
    ) as Record<string, unknown>;
    expect(decrypted.session_id).toEqual(expect.any(String));
  });

  it('creates session for device fallback path (no userId, no session_id)', () => {
    const req = makeReq();
    const res = makeRes();

    encryptAndSend({}, res, req);

    const all = getAllActiveSessions();
    expect(all.length).toBeGreaterThanOrEqual(1);
    const deviceSession = all.find((s) => s.key.startsWith('device_'));
    expect(deviceSession).toBeDefined();
  });
});
