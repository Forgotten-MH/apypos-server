import express, { type Request, type Response } from 'express';
import { createLogger } from '../middleware/logger.js';
import { EncryptionService } from '../services/crypto/encryptionService.js';
import { forwardRequest } from './forwarder.js';
import { SessionRecorder } from './recorder.js';
import { SessionReplayer } from './replayer.js';
import { RuleEngine } from './rules.js';
import type { ProxyConfig, ProxyMode } from './types.js';

const log = createLogger('proxy');

interface ProxyState {
  mode: ProxyMode;
  recorder: SessionRecorder | null;
  replayer: SessionReplayer | null;
  ruleEngine: RuleEngine | null;
  exchangeCount: number;
}

function collectRawBody(req: Request): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function tryDecrypt(enc: EncryptionService, data: Buffer): unknown {
  try {
    const decrypted = enc.decrypt(data);
    const cleaned = decrypted.replace(/\0+$/, '').trim();
    return JSON.parse(cleaned) as unknown;
  } catch {
    return null;
  }
}

export function createProxyApp(config: ProxyConfig) {
  const app = express();
  const enc = new EncryptionService();

  const state: ProxyState = {
    mode: config.mode,
    recorder: null,
    replayer: null,
    ruleEngine: null,
    exchangeCount: 0,
  };

  // Initialize based on mode
  if (config.mode === 'record' || config.mode === 'live') {
    state.recorder = new SessionRecorder(config.upstream);
  }
  if (config.mode === 'replay' && config.recordingFile) {
    state.replayer = new SessionReplayer(config.recordingFile);
  }
  if (config.mode === 'live' && config.rulesFile) {
    state.ruleEngine = new RuleEngine(config.rulesFile);
  }

  // --- Control endpoints (unencrypted, localhost only) ---

  app.get('/__proxy/status', (_req: Request, res: Response) => {
    res.json({
      mode: state.mode,
      exchangeCount: state.exchangeCount,
      recordedExchanges: state.recorder?.exchangeCount ?? 0,
      replayExchanges: state.replayer?.exchangeCount ?? 0,
      ruleCount: state.ruleEngine?.ruleCount ?? 0,
    });
  });

  app.post('/__proxy/mode/live', (_req: Request, res: Response) => {
    if (state.mode === 'live') {
      res.json({ message: 'Already in live mode' });
      return;
    }
    log.info(`Switching from ${state.mode} to live mode`);
    state.mode = 'live';
    if (!state.recorder) {
      state.recorder = new SessionRecorder(config.upstream);
    }
    if (config.rulesFile && !state.ruleEngine) {
      state.ruleEngine = new RuleEngine(config.rulesFile);
    }
    res.json({ message: 'Switched to live mode', upstream: config.upstream });
  });

  app.post('/__proxy/mode/replay', (_req: Request, res: Response) => {
    if (state.mode === 'replay') {
      res.json({ message: 'Already in replay mode' });
      return;
    }
    if (!state.replayer) {
      res.status(400).json({ error: 'No recording loaded for replay' });
      return;
    }
    log.info(`Switching from ${state.mode} to replay mode`);
    state.mode = 'replay';
    res.json({ message: 'Switched to replay mode' });
  });

  app.get('/__proxy/session', (_req: Request, res: Response) => {
    if (state.recorder) {
      res.json(state.recorder.getSession());
    } else if (state.replayer) {
      res.json(state.replayer.getSession());
    } else {
      res.json({ exchanges: [] });
    }
  });

  // --- Main proxy handler ---

  app.all('/{*path}', async (req: Request, res: Response) => {
    const url = req.originalUrl;
    const method = req.method;
    const start = Date.now();

    try {
      const rawBody = await collectRawBody(req);
      const contentType = req.get('content-type') ?? '';
      const isEncrypted = contentType.includes('application/octet-stream') && rawBody.length > 0;

      // Decrypt request for logging
      let decryptedRequest: unknown = null;
      if (isEncrypted) {
        decryptedRequest = tryDecrypt(enc, rawBody);
        if (config.verbose && decryptedRequest) {
          log.info(`→ ${method} ${url}\n${JSON.stringify(decryptedRequest, null, 2)}`);
        } else {
          log.info(`→ ${method} ${url} (encrypted, ${rawBody.length} bytes)`);
        }
      } else {
        log.info(`→ ${method} ${url} (${rawBody.length} bytes)`);
      }

      if (state.mode === 'replay') {
        handleReplay(state, enc, config, url, method, decryptedRequest, isEncrypted, start, res);
      } else {
        await handleForward(state, enc, config, url, method, rawBody, decryptedRequest, isEncrypted, start, req, res);
      }
    } catch (err) {
      log.error(`Proxy error on ${method} ${url}:`, err);
      res.status(502).send('Proxy Error');
    }
  });

  return { app, state };
}

function handleReplay(
  state: ProxyState,
  enc: EncryptionService,
  config: ProxyConfig,
  url: string,
  method: string,
  decryptedRequest: unknown,
  isEncrypted: boolean,
  start: number,
  res: Response,
): void {
  if (!state.replayer) {
    res.status(503).send('No recording loaded');
    return;
  }

  const match = state.replayer.findResponse(url, method);
  if (!match) {
    res.status(404).send('No recorded response for this request');
    return;
  }

  state.exchangeCount++;

  if (match.isEncrypted && match.responseBody !== null) {
    // Patch time fields and re-encrypt
    let body = match.responseBody as Record<string, unknown>;
    body = SessionReplayer.patchTimeFields(body);

    if (config.verbose) {
      log.info(`← ${match.responseStatus} (replay #${match.seq})\n${JSON.stringify(body, null, 2)}`);
    }

    const encrypted = enc.encrypt(JSON.stringify(body));
    res
      .status(match.responseStatus)
      .header('Content-Type', 'application/octet-stream')
      .send(encrypted);
  } else {
    // Non-encrypted response (static files, etc.)
    if (match.responseBody !== null) {
      res.status(match.responseStatus).json(match.responseBody);
    } else {
      res.status(match.responseStatus).send('');
    }
  }

  // Also record replay exchanges for the session log
  state.recorder?.addExchange({
    timestamp: new Date().toISOString(),
    url,
    method,
    requestBody: decryptedRequest,
    responseStatus: match.responseStatus,
    responseBody: match.responseBody,
    isEncrypted,
    durationMs: Date.now() - start,
  });
}

async function handleForward(
  state: ProxyState,
  enc: EncryptionService,
  config: ProxyConfig,
  url: string,
  method: string,
  rawBody: Buffer,
  decryptedRequest: unknown,
  isEncrypted: boolean,
  start: number,
  req: Request,
  res: Response,
): Promise<void> {
  // Forward the original bytes to upstream
  const result = await forwardRequest(
    config.upstream,
    method,
    url,
    req.headers as Record<string, string | string[] | undefined>,
    rawBody,
  );

  const responseContentType = result.headers['content-type'] ?? '';
  const responseIsEncrypted =
    responseContentType.includes('application/octet-stream') && result.body.length > 0;

  // Decrypt response for logging
  let decryptedResponse: unknown = null;
  if (responseIsEncrypted) {
    decryptedResponse = tryDecrypt(enc, result.body);
  }

  if (config.verbose && decryptedResponse) {
    log.info(`← ${result.status} (${result.durationMs}ms)\n${JSON.stringify(decryptedResponse, null, 2)}`);
  } else {
    log.info(`← ${result.status} (${result.body.length} bytes, ${result.durationMs}ms)`);
  }

  state.exchangeCount++;

  // Record the exchange
  state.recorder?.addExchange({
    timestamp: new Date().toISOString(),
    url,
    method,
    requestBody: decryptedRequest,
    responseStatus: result.status,
    responseBody: decryptedResponse,
    isEncrypted: responseIsEncrypted,
    durationMs: result.durationMs,
  });

  // In live mode, apply rules if response is encrypted JSON
  let responseBytes = result.body;
  if (state.mode === 'live' && state.ruleEngine && responseIsEncrypted && decryptedResponse) {
    const [modified, wasModified] = state.ruleEngine.apply(
      url,
      decryptedResponse as Record<string, unknown>,
    );
    if (wasModified) {
      log.info(`Rule applied on ${url}, re-encrypting`);
      responseBytes = enc.encrypt(JSON.stringify(modified));
    }
  }

  // Forward response headers (skip hop-by-hop)
  for (const [key, value] of Object.entries(result.headers)) {
    if (value === undefined) continue;
    const lower = key.toLowerCase();
    if (lower === 'transfer-encoding' || lower === 'connection') continue;
    res.setHeader(key, value);
  }

  res.status(result.status).send(responseBytes);

  // Flush recording periodically
  if (state.recorder && state.recorder.exchangeCount % 10 === 0) {
    state.recorder.flush();
  }
}
