import { app } from './app.js';
import { makeDownloadList } from './services/initResourceDownloadList.js';
import mongoose from 'mongoose';
import {
  IP,
  PORT,
  DB_USER,
  DB_NAME,
  DB_PASSWORD,
  DB_IP,
  DB_PORT,
  SSL_KEY_PATH,
  SSL_CERT_PATH,
  SSL_CA_PATH,
} from './config.js';
import { createLogger } from './middleware/logger.js';

const log = createLogger('server');

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Server } from 'socket.io';

import { onConnect } from './multiServer.js';

import http from 'http';
import https from 'https';
import { restoreSessions } from './services/session/sessionService.js';
import { seedDatabase } from './services/seedService.js';

const useHttps = PORT === 443;
const defaultKeysDir = join(import.meta.dirname, '..', 'keys');
const credentials: https.ServerOptions = useHttps
  ? {
      key: readFileSync(SSL_KEY_PATH || join(defaultKeysDir, 'private.key')),
      cert: readFileSync(SSL_CERT_PATH || join(defaultKeysDir, 'certificate.crt')),
      ca: readFileSync(SSL_CA_PATH || SSL_CERT_PATH || join(defaultKeysDir, 'certificate.crt')),
    }
  : {};

mongoose
  .connect(`mongodb://${DB_USER}:${DB_PASSWORD}@${DB_IP}:${DB_PORT}`, {
    dbName: DB_NAME,
  })
  .then(async () => {
    log.info('Connected to MongoDB...');
    await restoreSessions();

    const downloadCategories = ['openingDL', 'tutorialDL', 'trainingDL', 'v0282/stdDL'];
    const platforms = ['android', 'ios'];

    try {
      platforms.forEach((platform) => {
        downloadCategories.forEach((category) => {
          makeDownloadList(category, platform);
        });
      });
    } catch (error) {
      log.error(
        "Failed to create FPK download lists. Please ensure the FPK files are located in './src/public/res/' and the server is properly configured.",
        error,
      );
    }
    app.use((req, res, next) => {
      log.debug(`Request method: ${req.method}`);
      log.debug(`Request URL: ${req.url}`);
      log.debug('Request Headers: %o', req.headers);
      log.debug('Request Body: %o', req.body);
      next();
    });

    const server = useHttps ? https.createServer(credentials, app) : http.createServer(app);

    const io = new Server(server, {
      allowEIO3: true,
      cors: { origin: '*' },
    });

    io.use((socket, next) => {
      log.info(`Incoming connection: ${socket.id}`);
      log.debug('Socket data: %o', socket.data);

      socket.onAny((eventName, arg) => {
        if (Buffer.isBuffer(arg)) {
          log.debug(
            `Received ${eventName} Buffer at ${new Date().toISOString()}:\n` + arg.toString('hex'),
          );
        } else {
          log.debug(`Received ${eventName} Buffer at ${new Date().toISOString()}:\n` + arg);
        }
      });

      next();
    });

    io.on('connection', onConnect);

    server.listen(PORT, () => {
      void seedDatabase(log);

      //TODO Instantiate entire ocean map here.

      log.info(`Apypos Server Internal Test v0.0.12 started on ${IP}:${PORT}`);
    });
  })
  .catch((err: unknown) =>
    log.error("Coudn't Start Apypos Server: Couldn't connect to MongoDB....", err),
  );
