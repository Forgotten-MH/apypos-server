import * as http from 'node:http';
import { createLogger } from '../middleware/logger.js';

const log = createLogger('proxy:forwarder');

export interface ForwardResult {
  status: number;
  headers: http.IncomingHttpHeaders;
  body: Buffer;
  durationMs: number;
}

export function forwardRequest(
  upstream: string,
  method: string,
  url: string,
  headers: Record<string, string | string[] | undefined>,
  body: Buffer,
): Promise<ForwardResult> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const parsed = new URL(url, upstream);

    const reqHeaders: Record<string, string | string[]> = {};
    for (const [key, value] of Object.entries(headers)) {
      if (value === undefined) continue;
      const lower = key.toLowerCase();
      // Skip hop-by-hop headers and host (we set our own)
      if (lower === 'host' || lower === 'connection' || lower === 'transfer-encoding') continue;
      reqHeaders[key] = value;
    }
    reqHeaders['host'] = parsed.host;
    if (body.length > 0) {
      reqHeaders['content-length'] = String(body.length);
    }

    const options: http.RequestOptions = {
      hostname: parsed.hostname,
      port: parsed.port || 80,
      path: parsed.pathname + parsed.search,
      method,
      headers: reqHeaders,
    };

    log.debug(`→ ${method} ${parsed.pathname}`);

    const req = http.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        const responseBody = Buffer.concat(chunks);
        const durationMs = Date.now() - start;
        log.debug(`← ${res.statusCode} (${responseBody.length} bytes, ${durationMs}ms)`);
        resolve({
          status: res.statusCode ?? 500,
          headers: res.headers,
          body: responseBody,
          durationMs,
        });
      });
    });

    req.on('error', (err) => {
      log.error(`Forward error: ${err.message}`);
      reject(err);
    });

    if (body.length > 0) {
      req.write(body);
    }
    req.end();
  });
}
