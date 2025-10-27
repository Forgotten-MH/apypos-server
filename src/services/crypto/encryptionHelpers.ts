import { Response, Request } from "express";
import { EncryptionService } from "./encryptionService";
import { TimeService } from "../timeService";
import * as crypto from "crypto";

const encryptionService = new EncryptionService();

interface SessionInfo {
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

const timeService = new TimeService();
let lastCleanupTime = Date.now();

function startBackgroundCleanup() {
  setInterval(() => {
    const now = Date.now();
    if (now - lastCleanupTime > CLEANUP_INTERVAL) {
      smartCleanupExpiredSessions();
    }
  }, CLEANUP_INTERVAL);
}

startBackgroundCleanup();

function generateStableSessionToken(userId: string): string {
  const hash = crypto.createHash('md5').update(userId).digest('hex');
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
}

function generateUserBasedSessionKey(userId: string): string {
  return `user_${userId}`;
}

function smartCleanupExpiredSessions() {
  const now = Date.now();
  
  const shouldCleanup = 
    (now - lastCleanupTime > CLEANUP_INTERVAL) || 
    (sessionStore.size > MAX_SESSIONS_BEFORE_CLEANUP);
  
  if (!shouldCleanup) {
    return;
  }
  
  console.log(`[Cleanup] Starting cleanup, current sessions: ${sessionStore.size}`);
  
  let cleanedCount = 0;
  const expiredKeys: string[] = [];
  
  for (const [key, session] of sessionStore.entries()) {
    if (now - session.last_accessed > SESSION_TIMEOUT) {
      expiredKeys.push(key);
    }
  }
  
  expiredKeys.forEach(key => {
    sessionStore.delete(key);
    cleanedCount++;
  });
  
  lastCleanupTime = now;
  
  if (cleanedCount > 0) {
    console.log(`[Cleanup] Cleaned up ${cleanedCount} expired sessions, remaining: ${sessionStore.size}`);
  }
}

function quickCleanupCheck() {
  const now = Date.now();
  
  if (sessionStore.size > MAX_SESSIONS_BEFORE_CLEANUP || 
      (now - lastCleanupTime > CLEANUP_INTERVAL)) {
    smartCleanupExpiredSessions();
  }
}

function findSessionByToken(sessionToken: string): { key: string; session: SessionInfo } | null {
  for (const [key, session] of sessionStore.entries()) {
    if (session.session_token === sessionToken) {
      return { key, session };
    }
  }
  return null;
}

function generateSessionKey(req: Request): string {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  const userAgentHash = Buffer.from(userAgent).toString('base64').slice(0, 8);
  return `device_${userAgentHash}`;
}

export function encryptAndSend(
  data: object,
  res: Response,
  req: Request,
  error_code: number = 0, //TODO create a error code ENUM from EAPI_jpn.gmd in GUI_msg.arc
  error_category: number = 0, //1 seems to retry automatically  2: error 3:would you like to retry question
  error_detail: string = "",
  status: number = 200,

) {
  quickCleanupCheck();
  
  const now = Date.now();
  const userId = req.body?.user_id || req.query?.user_id;
  const clientSessionToken = req.body?.session_id;
  
  console.log(`[Session Debug] User ID: ${userId}, Client Session: ${clientSessionToken}, IP: ${req.ip}`);
  
  let sessionInfo: SessionInfo;
  let sessionKey: string;
  
  if (userId) {
    sessionKey = generateUserBasedSessionKey(userId);
    const session_token = generateStableSessionToken(userId);
    
    const existingSession = sessionStore.get(sessionKey);
    
    if (existingSession && (now - existingSession.last_accessed <= SESSION_TIMEOUT)) {
      sessionInfo = existingSession;
      sessionInfo.last_accessed = now;
      sessionInfo.ip_address = req.ip || req.connection.remoteAddress || 'unknown';
      sessionStore.set(sessionKey, sessionInfo);
      console.log(`Reusing existing session for user ${userId}:`, sessionInfo.session_token);
    } else {
      sessionInfo = {
        session_token,
        created_at: now,
        last_accessed: now,
        user_agent: req.get('User-Agent'),
        account_id: userId,
        game_id: req.body?.game_id,
        ip_address: req.ip || req.connection.remoteAddress || 'unknown',
        device_fingerprint: req.get('User-Agent') ? Buffer.from(req.get('User-Agent')!).toString('base64').slice(0, 8) : undefined
      };
      sessionStore.set(sessionKey, sessionInfo);
      console.log(`Generated stable session token for user ${userId}:`, session_token);
    }
  } else if (clientSessionToken) {
    const existingSession = findSessionByToken(clientSessionToken);
    
    if (existingSession && (now - existingSession.session.last_accessed <= SESSION_TIMEOUT)) {
      sessionKey = existingSession.key;
      sessionInfo = existingSession.session;
      sessionInfo.last_accessed = now;
      sessionInfo.ip_address = req.ip || req.connection.remoteAddress || 'unknown';
      sessionStore.set(sessionKey, sessionInfo);
      console.log(`Reusing existing session by token:`, sessionInfo.session_token);
    } else {
      sessionKey = `client_${clientSessionToken}`;
      const session_token = clientSessionToken;
      sessionInfo = {
        session_token,
        created_at: now,
        last_accessed: now,
        user_agent: req.get('User-Agent'),
        account_id: req.body?.user_id || req.query?.user_id,
        game_id: req.body?.game_id,
        ip_address: req.ip || req.connection.remoteAddress || 'unknown',
        device_fingerprint: req.get('User-Agent') ? Buffer.from(req.get('User-Agent')!).toString('base64').slice(0, 8) : undefined
      };
      sessionStore.set(sessionKey, sessionInfo);
      console.log(`Using client session token:`, session_token);
    }
  } else {
    sessionKey = generateSessionKey(req);
    const session_token = crypto.randomUUID().toString();
    sessionInfo = {
      session_token,
      created_at: now,
      last_accessed: now,
      user_agent: req.get('User-Agent'),
      account_id: req.body?.user_id || req.query?.user_id,
      game_id: req.body?.game_id,
      ip_address: req.ip || req.connection.remoteAddress || 'unknown',
      device_fingerprint: req.get('User-Agent') ? Buffer.from(req.get('User-Agent')!).toString('base64').slice(0, 8) : undefined
    };
    sessionStore.set(sessionKey, sessionInfo);
    console.log(`Generated new session token for ${sessionKey}:`, session_token);
  }
  
  const session_token = sessionInfo.session_token;

  const responseData = {
    ...data,
    error_code: error_code,
    error_category: error_category,
    error_detail: error_detail,
    app_ver_android: "09.03.06",
    app_ver_ios: "09.03.06",
    app_ver: "09.03.06",
    res_ver: 282, //controlls banner version url /download/android/v0282/stdDL/download.list Official Value: 282
    banner_ver: 91, //if set to 0 /api/banner/dllist/get is not called if you increment it to 1 it will be called then not called again untill incremented to 2 (Possible incremental update?) Official Value: 91
    session_id: session_token,
    block_seq: 0, //Possibly need to increment this for cycling encryption. (Client ignores if 0)
    one_day_time: timeService.getOneDayTime(),
    now_time: timeService.getNowTime(),
    relogin_time: timeService.getRelogTime(),
  };
  // console.log("Current Time Japan",timeService.getJapanTime())
  // console.log("Response: \n ############")
  // console.log(responseData)
  const encryptedData = encryptionService.encrypt(JSON.stringify(responseData));
  // console.log("now_time:",responseData.now_time)
  // console.log("relogin_time:",responseData.relogin_time)
  console.log("Response Body:\n", JSON.stringify(responseData, null, "\t"));

  res
    .status(status)
    .header("Content-Type", "application/octet-stream")
    .send(encryptedData);
}

export function decryptAndParse(data: Buffer) {
  const decryptedData = encryptionService.decrypt(data);
  const parsedData = JSON.parse(decryptedData);
  return parsedData;
}

export function getSessionInfo(sessionKey: string): SessionInfo | undefined {
  return sessionStore.get(sessionKey);
}

export function invalidateSession(sessionKey: string): boolean {
  return sessionStore.delete(sessionKey);
}

export function getAllActiveSessions(): Array<{key: string, info: SessionInfo}> {
  return Array.from(sessionStore.entries()).map(([key, info]) => ({key, info}));
}

export function getSessionCount(): number {
  return sessionStore.size;
}

export function clearAllSessions(): void {
  sessionStore.clear();
  console.log("All sessions cleared");
}

export function findSessionsByUser(identifier: string, type: 'account' | 'game' | 'session'): SessionInfo[] {
  const sessions: SessionInfo[] = [];
  const prefix = type === 'account' ? 'account_' : type === 'game' ? 'game_' : 'session_';
  const searchKey = `${prefix}${identifier}`;
  
  for (const [key, session] of sessionStore.entries()) {
    if (key === searchKey || 
        (type === 'account' && session.account_id === identifier) ||
        (type === 'game' && session.game_id === identifier)) {
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
    cleanupInterval: CLEANUP_INTERVAL
  };
  
  for (const [key, session] of sessionStore.entries()) {
    const type = key.split('_')[0];
    stats.byType[type] = (stats.byType[type] || 0) + 1;
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
    shouldCleanup: sessionStore.size > MAX_SESSIONS_BEFORE_CLEANUP || 
                   (now - lastCleanupTime > CLEANUP_INTERVAL)
  };
}

export function verifySessionToken(userId: string, sessionToken: string): boolean {
  const expectedToken = generateStableSessionToken(userId);
  return expectedToken === sessionToken;
}

export function getExpectedSessionToken(userId: string): string {
  return generateStableSessionToken(userId);
}

export function generateUniqueId(): string {
  return crypto.randomUUID().toString();
}