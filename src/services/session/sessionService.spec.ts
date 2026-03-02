import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../model/session');
vi.mock('../../middleware/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }),
}));

import Session from '../../model/session.js';
import {
  generateSessionToken,
  generateUserBasedSessionKey,
  generateSessionKey,
  setSession,
  getSessionInfo,
  invalidateSession,
  findSessionByToken,
  clearAllSessions,
  getAllActiveSessions,
  getSessionCount,
  findSessionsByUser,
  verifySessionToken,
  getSessionStats,
  getPerformanceStats,
  restoreSessions,
  quickCleanupCheck,
} from './sessionService.js';
import type { SessionInfo } from './sessionService.js';

function makeSession(overrides: Partial<SessionInfo> = {}): SessionInfo {
  return {
    session_token: 'test-token-123',
    created_at: Date.now(),
    last_accessed: Date.now(),
    user_agent: 'TestAgent/1.0',
    account_id: 'account-1',
    game_id: 'game-1',
    ip_address: '127.0.0.1',
    device_fingerprint: 'fp-abc',
    ...overrides,
  };
}

describe('sessionService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(Session.updateOne).mockResolvedValue({} as never);
    vi.mocked(Session.deleteOne).mockResolvedValue({} as never);
    vi.mocked(Session.deleteMany).mockResolvedValue({} as never);
    clearAllSessions();
  });

  describe('generateSessionToken', () => {
    it('returns a UUID string', () => {
      const token = generateSessionToken();
      expect(token).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('generates unique tokens on consecutive calls', () => {
      const tokens = new Set(Array.from({ length: 10 }, () => generateSessionToken()));
      expect(tokens.size).toBe(10);
    });
  });

  describe('generateUserBasedSessionKey', () => {
    it('returns user_{id} format', () => {
      expect(generateUserBasedSessionKey('abc')).toBe('user_abc');
    });
  });

  describe('generateSessionKey', () => {
    it('returns device_{hash} format from request', () => {
      const req = {
        ip: '10.0.0.1',
        socket: { remoteAddress: '10.0.0.1' },
        get: (header: string) => (header === 'User-Agent' ? 'MyAgent/2.0' : undefined),
      } as never;
      const key = generateSessionKey(req);
      expect(key).toMatch(/^device_[A-Za-z0-9+/=]+$/);
    });

    it('handles missing IP and User-Agent gracefully', () => {
      const req = {
        ip: undefined,
        socket: { remoteAddress: undefined },
        get: () => undefined,
      } as never;
      const key = generateSessionKey(req);
      expect(key).toMatch(/^device_/);
    });
  });

  describe('session CRUD', () => {
    it('setSession + getSessionInfo round-trip', () => {
      const session = makeSession();
      setSession('key-1', session);
      expect(getSessionInfo('key-1')).toEqual(session);
    });

    it('setSession persists to MongoDB via updateOne', () => {
      const session = makeSession();
      setSession('key-1', session);
      expect(Session.updateOne).toHaveBeenCalledWith(
        { key: 'key-1' },
        expect.objectContaining({ key: 'key-1', session_token: session.session_token }),
        { upsert: true },
      );
    });

    it('getSessionInfo returns undefined for unknown key', () => {
      expect(getSessionInfo('nonexistent')).toBeUndefined();
    });

    it('invalidateSession removes session and calls deleteOne', () => {
      const session = makeSession();
      setSession('key-1', session);
      const result = invalidateSession('key-1');
      expect(result).toBe(true);
      expect(getSessionInfo('key-1')).toBeUndefined();
      expect(Session.deleteOne).toHaveBeenCalledWith({ key: 'key-1' });
    });

    it('invalidateSession returns false for unknown key', () => {
      expect(invalidateSession('nonexistent')).toBe(false);
    });

    it('findSessionByToken finds existing session', () => {
      const session = makeSession({ session_token: 'unique-tok' });
      setSession('key-1', session);
      const result = findSessionByToken('unique-tok');
      expect(result).toEqual({ key: 'key-1', session: session });
    });

    it('findSessionByToken returns null for unknown token', () => {
      expect(findSessionByToken('nonexistent')).toBeNull();
    });
  });

  describe('bulk operations', () => {
    it('clearAllSessions resets count to 0 and calls deleteMany', () => {
      setSession('a', makeSession());
      setSession('b', makeSession());
      clearAllSessions();
      expect(getSessionCount()).toBe(0);
      expect(Session.deleteMany).toHaveBeenCalledWith({});
    });

    it('getAllActiveSessions returns stored sessions', () => {
      const s1 = makeSession({ session_token: 't1' });
      const s2 = makeSession({ session_token: 't2' });
      setSession('a', s1);
      setSession('b', s2);
      const all = getAllActiveSessions();
      expect(all).toHaveLength(2);
      expect(all.map((s) => s.key)).toEqual(expect.arrayContaining(['a', 'b']));
    });

    it('getSessionCount returns correct count', () => {
      expect(getSessionCount()).toBe(0);
      setSession('a', makeSession());
      expect(getSessionCount()).toBe(1);
      setSession('b', makeSession());
      expect(getSessionCount()).toBe(2);
    });
  });

  describe('findSessionsByUser', () => {
    it('matches by account type', () => {
      const session = makeSession({ account_id: 'acct-42' });
      setSession('some-key', session);
      const result = findSessionsByUser('acct-42', 'account');
      expect(result).toHaveLength(1);
      expect(result[0]!.account_id).toBe('acct-42');
    });

    it('matches by game type', () => {
      const session = makeSession({ game_id: 'gm-99' });
      setSession('some-key', session);
      const result = findSessionsByUser('gm-99', 'game');
      expect(result).toHaveLength(1);
      expect(result[0]!.game_id).toBe('gm-99');
    });

    it('matches by session key prefix', () => {
      const session = makeSession();
      setSession('session_my-id', session);
      const result = findSessionsByUser('my-id', 'session');
      expect(result).toHaveLength(1);
    });

    it('returns empty array for unknown identifier', () => {
      expect(findSessionsByUser('unknown', 'account')).toEqual([]);
    });
  });

  describe('verifySessionToken', () => {
    it('returns true for valid user+token pair', () => {
      const session = makeSession({ session_token: 'tok-abc' });
      setSession('user_u1', session);
      expect(verifySessionToken('u1', 'tok-abc')).toBe(true);
    });

    it('returns false for wrong token', () => {
      const session = makeSession({ session_token: 'tok-abc' });
      setSession('user_u1', session);
      expect(verifySessionToken('u1', 'wrong-token')).toBe(false);
    });

    it('returns false for nonexistent user', () => {
      expect(verifySessionToken('no-user', 'any-token')).toBe(false);
    });
  });

  describe('getSessionStats', () => {
    it('returns correct structure when empty', () => {
      const stats = getSessionStats();
      expect(stats).toEqual(
        expect.objectContaining({
          total: 0,
          byType: {},
          lastCleanup: expect.any(Number),
          cleanupInterval: expect.any(Number),
        }),
      );
    });

    it('counts sessions by key prefix type', () => {
      setSession('user_a', makeSession({ created_at: 100 }));
      setSession('user_b', makeSession({ created_at: 200 }));
      setSession('device_c', makeSession({ created_at: 300 }));
      const stats = getSessionStats();
      expect(stats.total).toBe(3);
      expect(stats.byType['user']).toBe(2);
      expect(stats.byType['device']).toBe(1);
      expect(stats.oldest).toBe(100);
      expect(stats.newest).toBe(300);
    });
  });

  describe('getPerformanceStats', () => {
    it('returns correct structure', () => {
      const stats = getPerformanceStats();
      expect(stats).toEqual(
        expect.objectContaining({
          sessionCount: expect.any(Number),
          lastCleanupTime: expect.any(Number),
          timeSinceLastCleanup: expect.any(Number),
          shouldCleanup: expect.any(Boolean),
        }),
      );
    });
  });

  describe('restoreSessions', () => {
    it('restores sessions from database and returns count', async () => {
      const docs = [
        {
          key: 'user_a',
          session_token: 'tok-a',
          created_at: Date.now(),
          last_accessed: Date.now(),
          user_agent: 'Agent/1',
          account_id: 'a1',
          game_id: 'g1',
          ip_address: '1.2.3.4',
          device_fingerprint: 'fp1',
        },
        {
          key: 'user_b',
          session_token: 'tok-b',
          created_at: Date.now(),
          last_accessed: Date.now(),
        },
      ];
      vi.mocked(Session.find).mockResolvedValue(docs as never);

      const count = await restoreSessions();
      expect(count).toBe(2);
      expect(getSessionInfo('user_a')).toEqual(
        expect.objectContaining({ session_token: 'tok-a' }),
      );
      expect(getSessionInfo('user_b')).toEqual(
        expect.objectContaining({ session_token: 'tok-b' }),
      );
    });

    it('returns 0 when no sessions in database', async () => {
      vi.mocked(Session.find).mockResolvedValue([] as never);
      const count = await restoreSessions();
      expect(count).toBe(0);
    });
  });

  describe('quickCleanupCheck', () => {
    it('does not crash when called', () => {
      expect(() => quickCleanupCheck()).not.toThrow();
    });

    it('does not crash with sessions present', () => {
      setSession('a', makeSession());
      expect(() => quickCleanupCheck()).not.toThrow();
    });
  });
});
