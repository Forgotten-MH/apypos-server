import { Response, Request } from 'express';
import { EncryptionService } from './encryptionService.js';
import { TimeService } from '../timeService.js';
import { createLogger } from '../../middleware/logger.js';
import { PROTOCOL } from '../../constants/protocol.js';
import {
  type SessionInfo,
  quickCleanupCheck,
  generateUserBasedSessionKey,
  generateSessionToken,
  generateSessionKey,
  findSessionByToken,
  getSessionInfo as _getSessionInfo,
  setSession,
  SESSION_TIMEOUT,
} from '../session/sessionService.js';

// Re-export session functions for backward compatibility
export {
  restoreSessions,
  getSessionInfo,
  invalidateSession,
  getAllActiveSessions,
  getSessionCount,
  clearAllSessions,
  findSessionsByUser,
  getSessionStats,
  getPerformanceStats,
  verifySessionToken,
} from '../session/sessionService.js';

export { generateUniqueId } from '../../utils/generateUniqueId.js';

const log = createLogger('session');

const encryptionService = new EncryptionService();
const timeService = new TimeService();

export function encryptAndSend(
  data: object,
  res: Response,
  req: Request,
  error_code: number = 0,
  error_category: number = 0,
  error_detail: string = '',
  status: number = 200,
) {
  quickCleanupCheck();

  const now = Date.now();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const userId: string | undefined = req.body?.user_id || req.query?.user_id;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const clientSessionToken: string | undefined = req.body?.session_id;

  log.debug(
    `Session Debug - User ID: ${userId}, Client Session: ${clientSessionToken}, IP: ${req.ip}`,
  );

  let sessionInfo: SessionInfo;
  let sessionKey: string;

  if (userId) {
    sessionKey = generateUserBasedSessionKey(userId);

    const existingSession = _getSessionInfo(sessionKey);

    if (existingSession && now - existingSession.last_accessed <= SESSION_TIMEOUT) {
      sessionInfo = existingSession;
      sessionInfo.last_accessed = now;
      sessionInfo.ip_address = req.ip || req.socket.remoteAddress || 'unknown';
      setSession(sessionKey, sessionInfo);
    } else {
      const session_token = generateSessionToken();
      sessionInfo = {
        session_token,
        created_at: now,
        last_accessed: now,
        user_agent: req.get('User-Agent'),
        account_id: userId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        game_id: req.body?.game_id,
        ip_address: req.ip || req.socket.remoteAddress || 'unknown',
        device_fingerprint: req.get('User-Agent')
          ? Buffer.from(req.get('User-Agent')!).toString('base64').slice(0, 8)
          : undefined,
      };
      setSession(sessionKey, sessionInfo);
    }
  } else if (clientSessionToken) {
    const existingSession = findSessionByToken(clientSessionToken);

    if (existingSession && now - existingSession.session.last_accessed <= SESSION_TIMEOUT) {
      sessionKey = existingSession.key;
      sessionInfo = existingSession.session;
      sessionInfo.last_accessed = now;
      sessionInfo.ip_address = req.ip || req.socket.remoteAddress || 'unknown';
      setSession(sessionKey, sessionInfo);
    } else {
      sessionKey = `client_${clientSessionToken}`;
      const session_token = clientSessionToken;
      sessionInfo = {
        session_token,
        created_at: now,
        last_accessed: now,
        user_agent: req.get('User-Agent'),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        account_id: req.body?.user_id || req.query?.user_id,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        game_id: req.body?.game_id,
        ip_address: req.ip || req.socket.remoteAddress || 'unknown',
        device_fingerprint: req.get('User-Agent')
          ? Buffer.from(req.get('User-Agent')!).toString('base64').slice(0, 8)
          : undefined,
      };
      setSession(sessionKey, sessionInfo);
    }
  } else {
    sessionKey = generateSessionKey(req);
    const session_token = generateSessionToken();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const accountId: string | undefined = req.body?.user_id || req.query?.user_id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const gameId: string | undefined = req.body?.game_id;
    sessionInfo = {
      session_token,
      created_at: now,
      last_accessed: now,
      user_agent: req.get('User-Agent'),
      account_id: accountId,
      game_id: gameId,
      ip_address: req.ip || req.socket.remoteAddress || 'unknown',
      device_fingerprint: req.get('User-Agent')
        ? Buffer.from(req.get('User-Agent')!).toString('base64').slice(0, 8)
        : undefined,
    };
    setSession(sessionKey, sessionInfo);
  }

  const session_token = sessionInfo.session_token;

  const responseData = {
    ...data,
    error_code: error_code,
    error_category: error_category,
    error_detail: error_detail,
    app_ver_android: PROTOCOL.APP_VER,
    app_ver_ios: PROTOCOL.APP_VER,
    app_ver: PROTOCOL.APP_VER,
    res_ver: PROTOCOL.RES_VER,
    banner_ver: PROTOCOL.BANNER_VER,
    session_id: session_token,
    block_seq: PROTOCOL.BLOCK_SEQ,
    one_day_time: timeService.getOneDayTime(),
    now_time: timeService.getNowTime(),
    relogin_time: timeService.getRelogTime(),
  };
  log.debug('Response Body:\n%s', JSON.stringify(responseData, null, '\t'));
  const encryptedData = encryptionService.encrypt(JSON.stringify(responseData));

  res.status(status).header('Content-Type', 'application/octet-stream').send(encryptedData);
}

export function decryptAndParse(data: Buffer): unknown {
  const decryptedData = encryptionService.decrypt(data);
  // Strip Blowfish ECB padding (null bytes and other non-printable chars after JSON)
  const cleanedData = decryptedData.replace(/\0+$/, '').trim();
  const parsedData: unknown = JSON.parse(cleanedData);
  return parsedData;
}
