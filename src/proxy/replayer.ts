import * as fs from 'node:fs';
import { createLogger } from '../middleware/logger.js';
import type { RecordedExchange, RecordedSession } from './types.js';

const log = createLogger('proxy:replayer');

/** Fields to patch with current timestamps so the client doesn't reject stale sessions */
const TIME_FIELDS = ['now_time', 'one_day_time', 'relogin_time'] as const;

export class SessionReplayer {
  private session: RecordedSession;
  /** Per-URL call counter for matching by occurrence */
  private urlCounters = new Map<string, number>();

  constructor(recordingPath: string) {
    const raw = fs.readFileSync(recordingPath, 'utf-8');
    this.session = JSON.parse(raw) as RecordedSession;
    log.info(
      `Loaded recording: ${this.session.exchanges.length} exchanges from ${this.session.startedAt}`,
    );
  }

  /**
   * Find the next matching exchange for a given URL+method.
   * Matches by URL path and per-URL occurrence count.
   */
  findResponse(url: string, method: string): RecordedExchange | null {
    const count = this.urlCounters.get(url) ?? 0;

    // Find all exchanges matching this URL+method, then pick the nth occurrence
    const matches = this.session.exchanges.filter(
      (e) => e.url === url && e.method === method,
    );

    const match = matches[count];
    if (!match) {
      log.warn(`No recording match for ${method} ${url} (occurrence ${count})`);
      return null;
    }

    this.urlCounters.set(url, count + 1);
    log.debug(`Replaying #${match.seq}: ${method} ${url} (occurrence ${count})`);
    return match;
  }

  /**
   * Patch time fields in a response body to prevent session expiry during replay.
   */
  static patchTimeFields(body: Record<string, unknown>): Record<string, unknown> {
    const now = Math.floor(Date.now() / 1000);
    const patched = { ...body };
    for (const field of TIME_FIELDS) {
      if (field in patched) {
        if (field === 'one_day_time') {
          // Next midnight UTC
          const d = new Date();
          d.setUTCHours(24, 0, 0, 0);
          patched[field] = Math.floor(d.getTime() / 1000);
        } else if (field === 'relogin_time') {
          patched[field] = now + 86400;
        } else {
          patched[field] = now;
        }
      }
    }
    return patched;
  }

  get exchangeCount(): number {
    return this.session.exchanges.length;
  }

  getSession(): RecordedSession {
    return this.session;
  }
}
