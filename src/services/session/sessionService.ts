import * as crypto from 'crypto';
import { Request } from 'express';
import { createLogger } from '../../middleware/logger.js';
import Session from '../../model/session.js';

const log = createLogger('session');

export interface SessionInfo {
  session_token: string;
  created_at: number;
  last_accessed: number;
  user_agent?: string;
  account_id?: string;
  game_id?: string;
  ip_address?: string;
  device_fingerprint?: string;
}

const sessionStore: Map<string, SessionInfo> = new Map();
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;
const CLEANUP_INTERVAL = 5 * 60 * 1000;
const MAX_SESSIONS_BEFORE_CLEANUP = 1000;

let lastCleanupTime = Date.now();

function persistSession(key: string, session: SessionInfo) {
  Session.updateOne({ key }, { key, ...session }, { upsert: true }).catch((err: unknown) =>
    log.error('Failed to persist session:', err),
  );
}

function removePersistedSession(key: string) {
  Session.deleteOne({ key }).catch((err: unknown) =>
    log.error('Failed to remove persisted session:', err),
  );
}

export async function restoreSessions(): Promise<number> {
  const now = Date.now();
  const docs = await Session.find({
    last_accessed: { $gte: now - SESSION_TIMEOUT },
  });
  for (const doc of docs) {
    sessionStore.set(doc.key, {
      session_token: doc.session_token,
      created_at: doc.created_at,
      last_accessed: doc.last_accessed,
      user_agent: doc.user_agent,
      account_id: doc.account_id,
      game_id: doc.game_id,
      ip_address: doc.ip_address,
      device_fingerprint: doc.device_fingerprint,
    });
  }
  log.info(`Restored ${docs.length} sessions from database`);
  return docs.length;
}

function startBackgroundCleanup() {
  setInterval(() => {
    const now = Date.now();
    if (now - lastCleanupTime > CLEANUP_INTERVAL) {
      smartCleanupExpiredSessions();
    }
  }, CLEANUP_INTERVAL);
}

startBackgroundCleanup();

export function generateSessionToken(): string {
  return crypto.randomUUID();
}

export function generateUserBasedSessionKey(userId: string): string {
  return `user_${userId}`;
}

function smartCleanupExpiredSessions() {
  const now = Date.now();

  const shouldCleanup =
    now - lastCleanupTime > CLEANUP_INTERVAL || sessionStore.size > MAX_SESSIONS_BEFORE_CLEANUP;

  if (!shouldCleanup) {
    return;
  }

  log.info(`Cleanup starting, current sessions: ${sessionStore.size}`);

  let cleanedCount = 0;
  const expiredKeys: string[] = [];

  for (const [key, session] of sessionStore.entries()) {
    if (now - session.last_accessed > SESSION_TIMEOUT) {
      expiredKeys.push(key);
    }
  }

  expiredKeys.forEach((key) => {
    sessionStore.delete(key);
    removePersistedSession(key);
    cleanedCount++;
  });

  lastCleanupTime = now;

  if (cleanedCount > 0) {
    log.info(`Cleaned up ${cleanedCount} expired sessions, remaining: ${sessionStore.size}`);
  }
}

export function quickCleanupCheck() {
  const now = Date.now();

  if (sessionStore.size > MAX_SESSIONS_BEFORE_CLEANUP || now - lastCleanupTime > CLEANUP_INTERVAL) {
    smartCleanupExpiredSessions();
  }
}

export function findSessionByToken(sessionToken: string): { key: string; session: SessionInfo } | null {
  for (const [key, session] of sessionStore.entries()) {
    if (session.session_token === sessionToken) {
      return { key, session };
    }
  }
  return null;
}

export function generateSessionKey(req: Request): string {
  const _ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  const userAgentHash = Buffer.from(userAgent).toString('base64').slice(0, 8);
  return `device_${userAgentHash}`;
}

export function getSessionInfo(sessionKey: string): SessionInfo | undefined {
  return sessionStore.get(sessionKey);
}

export function setSession(key: string, session: SessionInfo): void {
  sessionStore.set(key, session);
  persistSession(key, session);
}

export function invalidateSession(sessionKey: string): boolean {
  removePersistedSession(sessionKey);
  return sessionStore.delete(sessionKey);
}

export function getAllActiveSessions(): Array<{
  key: string;
  info: SessionInfo;
}> {
  return Array.from(sessionStore.entries()).map(([key, info]) => ({
    key,
    info,
  }));
}

export function getSessionCount(): number {
  return sessionStore.size;
}

export function clearAllSessions(): void {
  sessionStore.clear();
  Session.deleteMany({}).catch((err: unknown) =>
    log.error('Failed to clear persisted sessions:', err),
  );
  log.info('All sessions cleared');
}

export function findSessionsByUser(
  identifier: string,
  type: 'account' | 'game' | 'session',
): SessionInfo[] {
  const sessions: SessionInfo[] = [];
  const prefix = type === 'account' ? 'account_' : type === 'game' ? 'game_' : 'session_';
  const searchKey = `${prefix}${identifier}`;

  for (const [key, session] of sessionStore.entries()) {
    if (
      key === searchKey ||
      (type === 'account' && session.account_id === identifier) ||
      (type === 'game' && session.game_id === identifier)
    ) {
      sessions.push(session);
    }
  }

  return sessions;
}

export function getSessionStats(): {
  total: number;
  byType: { [key: string]: number };
  oldest: number;
  newest: number;
  lastCleanup: number;
  cleanupInterval: number;
} {
  const stats = {
    total: sessionStore.size,
    byType: {} as { [key: string]: number },
    oldest: Date.now(),
    newest: 0,
    lastCleanup: lastCleanupTime,
    cleanupInterval: CLEANUP_INTERVAL,
  };

  for (const [key, session] of sessionStore.entries()) {
    const type = key.split('_')[0] ?? 'unknown';
    stats.byType[type] = (stats.byType[type] ?? 0) + 1;
    stats.oldest = Math.min(stats.oldest, session.created_at);
    stats.newest = Math.max(stats.newest, session.created_at);
  }

  return stats;
}

export function getPerformanceStats(): {
  sessionCount: number;
  lastCleanupTime: number;
  timeSinceLastCleanup: number;
  shouldCleanup: boolean;
} {
  const now = Date.now();
  return {
    sessionCount: sessionStore.size,
    lastCleanupTime: lastCleanupTime,
    timeSinceLastCleanup: now - lastCleanupTime,
    shouldCleanup:
      sessionStore.size > MAX_SESSIONS_BEFORE_CLEANUP || now - lastCleanupTime > CLEANUP_INTERVAL,
  };
}

export function verifySessionToken(userId: string, sessionToken: string): boolean {
  const sessionKey = generateUserBasedSessionKey(userId);
  const session = sessionStore.get(sessionKey);
  return session?.session_token === sessionToken;
}

export { SESSION_TIMEOUT };
