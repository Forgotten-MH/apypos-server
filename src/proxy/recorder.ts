import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { createLogger } from '../middleware/logger.js';
import type { RecordedExchange, RecordedSession } from './types.js';

const log = createLogger('proxy:recorder');

export class SessionRecorder {
  private session: RecordedSession;
  private outputDir: string;
  private outputPath: string;

  constructor(upstreamUrl: string, outputDir = 'recordings') {
    this.outputDir = outputDir;
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.outputPath = path.join(this.outputDir, `${timestamp}_${id}.json`);

    this.session = {
      id,
      startedAt: new Date().toISOString(),
      upstreamUrl,
      exchanges: [],
    };

    fs.mkdirSync(this.outputDir, { recursive: true });
    log.info(`Recording to ${this.outputPath}`);
  }

  addExchange(exchange: Omit<RecordedExchange, 'seq'>): void {
    const seq = this.session.exchanges.length;
    this.session.exchanges.push({ seq, ...exchange });
    log.debug(`Recorded #${seq}: ${exchange.method} ${exchange.url} → ${exchange.responseStatus}`);
  }

  flush(): void {
    fs.writeFileSync(this.outputPath, JSON.stringify(this.session, null, 2));
    log.info(`Flushed ${this.session.exchanges.length} exchanges to ${this.outputPath}`);
  }

  getSession(): RecordedSession {
    return this.session;
  }

  get exchangeCount(): number {
    return this.session.exchanges.length;
  }
}
