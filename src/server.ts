import { app } from './app';
import { makeDownloadList } from './services/initResourceDownloadList';
import mongoose from 'mongoose';
import { IP, PORT, DB_USER, DB_NAME, DB_PASSWORD, DB_IP, DB_PORT } from './config';
import { createLogger } from './middleware/logger';

const log = createLogger('server');
import normalTutorialQuestSheets from './json/questDB/normal.extended.complete.json';
import trainingQuestSheets from './json/questDB/training.extended.complete.json';
import scoreQuestSheets from './json/questDB/score.extended.complete.json';
import eternalQuestSheets from './json/questDB/eternal.extended.complete.json';
import ticketQuestSheets from './json/questDB/ticket.extended.complete.json';
import eventQuestSheets from './json/questDB/event.extended.blank.json';
import ticketEvents from './json/ticket_events.json';
import coevEvents from './json/coev_events.json';

import easyEvents from './json/easy_events.json';
import normEvents from './json/norm_events.json';
import hardEvents from './json/hard_events.json';
import forbEvents from './json/forb_events.json';

import { readFileSync } from 'fs';
import { Server } from 'socket.io';
import Event from './model/events';
import QuestSheet from './model/questSheet';

import { onConnect } from './multiServer';
import AssualtEvents from './model/events/assualts';
import TicketEvents from './model/events/tickets';
import ScoreEvents from './model/events/score';

import http from 'http';
import https from 'https';
import { restoreSessions } from './services/crypto/encryptionHelpers';

const useHttps = PORT === 443;
const credentials: https.ServerOptions = useHttps
  ? {
      key: readFileSync('../keys/private.key'),
      cert: readFileSync('../keys/certificate.crt'),
      ca: readFileSync('../keys/certificate.crt'),
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
      void Event.countDocuments({})
        .then((count) => {
          log.info(`Number of Events: ${count}`);
          if (count == 0) {
            const eventDefault = new Event();
            void eventDefault.save();
            log.info('Event Data imported successfully.');
          } else {
            log.info('Event Data is not empty. Skipping import.');
          }
        })
        .catch((err) => {
          log.error('Error:', err);
        });
      void AssualtEvents.countDocuments({})
        .then((count) => {
          log.info(`Number of Assualt Events: ${count}`);
          if (count == 0) {
            easyEvents.forEach((easyEvent) => {
              void AssualtEvents.create({
                appear_remain: Date.now(), //Only start when this hits 0
                disappear_remain: Date.now() + 30 * 24 * 60 * 60 * 1000,
                end_remain: Date.now() + 30 * 24 * 60 * 60 * 1000,
                start_remain: Date.now(), //Only show in UI when this hits 0
                ...easyEvent,
              });
            });
            normEvents.forEach((normEvent) => {
              void AssualtEvents.create({
                appear_remain: Date.now(), //Only start when this hits 0
                disappear_remain: Date.now() + 30 * 24 * 60 * 60 * 1000,
                end_remain: Date.now() + 30 * 24 * 60 * 60 * 1000,
                start_remain: Date.now(), //Only show in UI when this hits 0
                ...normEvent,
              });
            });
            hardEvents.forEach((hardEvent) => {
              void AssualtEvents.create({
                appear_remain: Date.now(), //Only start when this hits 0
                disappear_remain: Date.now() + 30 * 24 * 60 * 60 * 1000,
                end_remain: Date.now() + 30 * 24 * 60 * 60 * 1000,
                start_remain: Date.now(), //Only show in UI when this hits 0
                ...hardEvent,
              });
            });
            forbEvents.forEach((forbEvent) => {
              void AssualtEvents.create({
                appear_remain: Date.now(), //Only start when this hits 0
                disappear_remain: Date.now() + 30 * 24 * 60 * 60 * 1000,
                end_remain: Date.now() + 30 * 24 * 60 * 60 * 1000,
                start_remain: Date.now(), //Only show in UI when this hits 0
                ...forbEvent,
              });
            });

            log.info('✅ Assualt Event Data imported successfully.');
          } else {
            log.info('⚠️ Assualt Event Data is not empty. Skipping import.');
          }
        })
        .catch((err) => {
          log.error('Error:', err);
        });
      void ScoreEvents.countDocuments({})
        .then((count) => {
          log.info(`Number of Score Events: ${count}`);
          if (count == 0) {
            coevEvents.forEach((coevEvent) => {
              void ScoreEvents.create({
                end_remain: Date.now() + 30 * 24 * 60 * 60 * 1000,
                start_remain: Date.now(),
                ...coevEvent,
              });
            });

            log.info('✅ Score Event Data imported successfully.');
          } else {
            log.info('⚠️ Score Event Data is not empty. Skipping import.');
          }
        })
        .catch((err) => {
          log.error('Error:', err);
        });
      void TicketEvents.countDocuments({})
        .then((count) => {
          log.info(`Number of Ticket Events: ${count}`);
          if (count == 0) {
            ticketEvents.forEach((ticketEvent) => {
              void TicketEvents.create({
                buy_end_remain: Date.now() + 30 * 24 * 60 * 60 * 1000,
                buy_start_remain: Date.now() + 30 * 24 * 60 * 60 * 1000,
                clear_time: 0,
                end_remain: Date.now() + 30 * 24 * 60 * 60 * 1000,
                start_remain: Date.now(),
                ...ticketEvent,
              });
            });

            log.info('✅ Ticket Event Data imported successfully.');
          } else {
            log.info('⚠️ Ticket Event Data is not empty. Skipping import.');
          }
        })
        .catch((err) => {
          log.error('Error:', err);
        });
      void QuestSheet.countDocuments({})
        .then((count) => {
          log.info(`Number of Quests: ${count}`);
          if (count === 0) {
            void QuestSheet.insertMany(normalTutorialQuestSheets.rQuestSheet.mQuestDataList);
            void QuestSheet.insertMany(trainingQuestSheets.rQuestSheet.mQuestDataList);
            void QuestSheet.insertMany(scoreQuestSheets.rQuestSheet.mQuestDataList);
            void QuestSheet.insertMany(eternalQuestSheets.rQuestSheet.mQuestDataList);
            void QuestSheet.insertMany(ticketQuestSheets.rQuestSheet.mQuestDataList);
            void QuestSheet.insertMany(eventQuestSheets.rQuestSheet.mQuestDataList);

            log.info('✅ Quest Data imported successfully.');
          } else {
            log.info('⚠️ Quest Data is not empty. Skipping import.');
          }
        })
        .catch((err) => {
          log.error('Error:', err);
        });

      //TODO Instatiate entire ocean map here.

      log.info(`Apypos Server Internal Test v0.0.12 started on ${IP}:${PORT}`);
    });
  })
  .catch((err) => log.error("Coudn't Start Apypos Server: Couldn't connect to MongoDB....", err));
