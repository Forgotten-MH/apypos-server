import { app } from './app';
import { makeDownloadList } from './services/initResourceDownloadList';
import mongoose from 'mongoose';
import {
  IP,
  PORT,
  DB_USER,
  DB_NAME,
  DB_PASSWORD,
  DB_IP,
  DB_PORT,
  DEBUG,
} from './config';
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
  .then(() => {
    console.log('Connected to MongoDB...');

    const downloadCategories = [
      'openingDL',
      'tutorialDL',
      'trainingDL',
      'v0282/stdDL',
    ];
    const platforms = ['android', 'ios'];

    try {
      platforms.forEach((platform) => {
        downloadCategories.forEach((category) => {
          makeDownloadList(category, platform);
        });
      });
    } catch (error) {
      console.error(
        'Failed to create FPK download lists. Please ensure the FPK files are located in \'./src/public/res/\' and the server is properly configured.',
        error
      );
    }
    if (DEBUG) {
      app.use((req, res, next) => {
        console.log(`Request method: ${req.method}`);
        console.log(`Request URL: ${req.url}`);
        console.log('Request Headers:', req.headers);
        console.log('Request Body:', req.body);
        next();
      });
    }

    const server = useHttps
      ? https.createServer(credentials, app)
      : http.createServer(app);

    const io = new Server(server, {
      allowEIO3: true,
      cors: { origin: '*' },
    });

    io.use((socket, next) => {
      console.log(`Incoming connection: ${socket.id}`);
      console.log(` ${socket.data}`);

      socket.onAny((eventName, arg) => {
        if (Buffer.isBuffer(arg)) {
          console.log(
            `Received ${eventName} Buffer at ${new Date().toISOString()}:\n` +
              arg.toString('hex')
          );
        } else {
          console.log(
            `Received ${eventName} Buffer at ${new Date().toISOString()}:\n` +
              arg
          );
        }
      });

      next();
    });

    io.on('connection', onConnect);

    server.listen(PORT, () => {
      Event.countDocuments({})
        .then((count) => {
          console.log(`Number of Events: ${count}`);
          if (count == 0) {
            const eventDefault = new Event();
            eventDefault.save();
            console.log('✅ Event Data imported successfully.');
          } else {
            console.log('⚠️ Event Data is not empty. Skipping import.');
          }
        })
        .catch((err) => {
          console.error(err);
        });
      AssualtEvents.countDocuments({})
        .then((count) => {
          console.log(`Number of Assualt Events: ${count}`);
          if (count == 0) {
            easyEvents.map((easyEvent) => {
              AssualtEvents.create({
                appear_remain: Date.now(), //Only start when this hits 0
                disappear_remain: Date.now() + 30 * 24 * 60 * 60 * 1000,
                end_remain: Date.now() + 30 * 24 * 60 * 60 * 1000,
                start_remain: Date.now(), //Only show in UI when this hits 0
                ...easyEvent,
              });
            });
            normEvents.map((normEvent) => {
              AssualtEvents.create({
                appear_remain: Date.now(), //Only start when this hits 0
                disappear_remain: Date.now() + 30 * 24 * 60 * 60 * 1000,
                end_remain: Date.now() + 30 * 24 * 60 * 60 * 1000,
                start_remain: Date.now(), //Only show in UI when this hits 0
                ...normEvent,
              });
            });
            hardEvents.map((hardEvent) => {
              AssualtEvents.create({
                appear_remain: Date.now(), //Only start when this hits 0
                disappear_remain: Date.now() + 30 * 24 * 60 * 60 * 1000,
                end_remain: Date.now() + 30 * 24 * 60 * 60 * 1000,
                start_remain: Date.now(), //Only show in UI when this hits 0
                ...hardEvent,
              });
            });
            forbEvents.map((forbEvent) => {
              AssualtEvents.create({
                appear_remain: Date.now(), //Only start when this hits 0
                disappear_remain: Date.now() + 30 * 24 * 60 * 60 * 1000,
                end_remain: Date.now() + 30 * 24 * 60 * 60 * 1000,
                start_remain: Date.now(), //Only show in UI when this hits 0
                ...forbEvent,
              });
            });

            console.log('✅ Assualt Event Data imported successfully.');
          } else {
            console.log('⚠️ Assualt Event Data is not empty. Skipping import.');
          }
        })
        .catch((err) => {
          console.error(err);
        });
      ScoreEvents.countDocuments({})
        .then((count) => {
          console.log(`Number of Score Events: ${count}`);
          if (count == 0) {
            coevEvents.map((coevEvent) => {
              ScoreEvents.create({
                end_remain: Date.now() + 30 * 24 * 60 * 60 * 1000,
                start_remain: Date.now(),
                ...coevEvent,
              });
            });

            console.log('✅ Score Event Data imported successfully.');
          } else {
            console.log('⚠️ Score Event Data is not empty. Skipping import.');
          }
        })
        .catch((err) => {
          console.error(err);
        });
      TicketEvents.countDocuments({})
        .then((count) => {
          console.log(`Number of Ticket Events: ${count}`);
          if (count == 0) {
            ticketEvents.map((ticketEvent) => {
              TicketEvents.create({
                buy_end_remain: Date.now() + 30 * 24 * 60 * 60 * 1000,
                buy_start_remain: Date.now() + 30 * 24 * 60 * 60 * 1000,
                clear_time: 0,
                end_remain: Date.now() + 30 * 24 * 60 * 60 * 1000,
                start_remain: Date.now(),
                ...ticketEvent,
              });
            });

            console.log('✅ Ticket Event Data imported successfully.');
          } else {
            console.log('⚠️ Ticket Event Data is not empty. Skipping import.');
          }
        })
        .catch((err) => {
          console.error(err);
        });
      QuestSheet.countDocuments({})
        .then((count) => {
          console.log(`Number of Quests: ${count}`);
          if (count === 0) {
            QuestSheet.create(
              normalTutorialQuestSheets.rQuestSheet.mQuestDataList
            );
            QuestSheet.create(trainingQuestSheets.rQuestSheet.mQuestDataList);
            QuestSheet.create(scoreQuestSheets.rQuestSheet.mQuestDataList);
            QuestSheet.create(eternalQuestSheets.rQuestSheet.mQuestDataList);
            QuestSheet.create(ticketQuestSheets.rQuestSheet.mQuestDataList);
            QuestSheet.create(eventQuestSheets.rQuestSheet.mQuestDataList);

            console.log('✅ Quest Data imported successfully.');
          } else {
            console.log('⚠️ Quest Data is not empty. Skipping import.');
          }
        })
        .catch((err) => {
          console.error(err);
        });

      //TODO Instatiate entire ocean map here.

      console.log(
        `Apypos Server Internal Test v0.0.12 started on ${IP}:${PORT}`
      );
    });
  })
  .catch((err) =>
    console.error(
      'Coudn\'t Start Apypos Server: Couldn\'t connect to MongoDB....',
      err
    )
  );
