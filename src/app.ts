import { fileURLToPath } from 'node:url';
import express from 'express';

const __dirname = import.meta.dirname ?? fileURLToPath(new URL('.', import.meta.url));
import routes from './routes/routes.js';
import expressWinston from 'express-winston';
import { logger } from './middleware/logger.js';
import { createLogger } from './middleware/logger.js';
import winston from 'winston';
import { decryptAndParse } from './services/crypto/encryptionHelpers.js';

const log = createLogger('app');

function sanitize(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }
  if (obj !== null && typeof obj === 'object') {
    const clean: Record<string, unknown> = {};
    for (const key of Object.keys(obj as Record<string, unknown>)) {
      if (!key.startsWith('$')) {
        clean[key] = sanitize((obj as Record<string, unknown>)[key]);
      }
    }
    return clean;
  }
  return obj;
}

const app = express();
// Middleware to capture raw data from 'application/octet-stream' content type
app.use((req, res, next) => {
  if (req.is('application/octet-stream')) {
    const data: Buffer[] = [];

    req.on('data', (chunk: Buffer) => {
      data.push(chunk);
    });

    req.on('end', () => {
      const rawBody = Buffer.concat(data);
      try {
        const decryptedBody = decryptAndParse(rawBody);
        req.body = decryptedBody;
        log.debug('Request Body:\n%s', JSON.stringify(req.body, null, '\t'));
      } catch (err) {
        log.error('Failed to decrypt request body:', err);
        res.status(400).send('Bad Request');
        return;
      }

      next();
    });

    req.on('error', (err) => {
      log.error('Error processing raw request:', err);
      next(err);
    });
  } else {
    log.debug('Request Body:\n%s', JSON.stringify(req.body, null, '\t'));
    next();
  }
});
app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.timestamp({
        format: 'YYYY-MM-DD hh:mm:ss.SSS A',
      }),
      winston.format.printf((info) => {
        return `[${String(info.timestamp)}] ${info.level}: ${String(info.message)} \n`;
      }),
    ),
    meta: true,
    expressFormat: true,
    colorize: true,

    dynamicMeta: (req, _res) => {
      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        body: req.body,
      };
    },
  }),
);
// Sanitize request body: strip keys starting with '$' to prevent MongoDB operator injection
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitize(req.body);
  }
  next();
});

// Setup routes
app.use('/', routes);
app.use('/', express.static(__dirname + '/public'));
// Catch-all 404 handler to log unmatched routes
app.use((req, res, next) => {
  log.warn('404 UNMATCHED: %s %s', req.method, req.originalUrl);
  next();
});
// Error logger middleware
app.use(
  expressWinston.errorLogger({
    transports: logger.transports,
    format: winston.format.combine(winston.format.colorize(), winston.format.json()),
  }),
);

export { app };
