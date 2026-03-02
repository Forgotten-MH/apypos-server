import { Event, AssualtEvents, ScoreEvents, TicketEvents } from '../model/events/index.js';
import QuestSheet from '../model/questSheet.js';

import normalTutorialQuestSheets from '../json/questDB/normal.extended.complete.json' with { type: 'json' };
import trainingQuestSheets from '../json/questDB/training.extended.complete.json' with { type: 'json' };
import scoreQuestSheets from '../json/questDB/score.extended.complete.json' with { type: 'json' };
import eternalQuestSheets from '../json/questDB/eternal.extended.complete.json' with { type: 'json' };
import ticketQuestSheets from '../json/questDB/ticket.extended.complete.json' with { type: 'json' };
import eventQuestSheets from '../json/questDB/event.extended.blank.json' with { type: 'json' };
import ticketEvents from '../json/ticket_events.json' with { type: 'json' };
import coevEvents from '../json/coev_events.json' with { type: 'json' };
import easyEvents from '../json/easy_events.json' with { type: 'json' };
import normEvents from '../json/norm_events.json' with { type: 'json' };
import hardEvents from '../json/hard_events.json' with { type: 'json' };
import forbEvents from '../json/forb_events.json' with { type: 'json' };

// Type definition for quest sheet JSON imports
interface QuestSheetJson {
  rQuestSheet: {
    mQuestDataList: Record<string, unknown>[];
  };
}

// Cast JSON imports to resolve deep nested type access
const typedNormal = normalTutorialQuestSheets as unknown as QuestSheetJson;
const typedTraining = trainingQuestSheets as unknown as QuestSheetJson;
const typedScore = scoreQuestSheets as unknown as QuestSheetJson;
const typedEternal = eternalQuestSheets as unknown as QuestSheetJson;
const typedTicket = ticketQuestSheets as unknown as QuestSheetJson;
const typedEvent = eventQuestSheets as unknown as QuestSheetJson;

interface Logger {
  info: (message: string) => void;
  error: (message: string, error?: unknown) => void;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

async function seedEvents(log: Logger): Promise<void> {
  const count = await Event.countDocuments({});
  log.info(`Number of Events: ${count}`);
  if (count == 0) {
    const eventDefault = new Event();
    await eventDefault.save();
    log.info('Event Data imported successfully.');
  } else {
    log.info('Event Data is not empty. Skipping import.');
  }
}

async function seedAssaultEvents(log: Logger): Promise<void> {
  const count = await AssualtEvents.countDocuments({});
  log.info(`Number of Assualt Events: ${count}`);
  if (count == 0) {
    const allEvents = [
      ...easyEvents,
      ...normEvents,
      ...hardEvents,
      ...forbEvents,
    ];
    for (const event of allEvents) {
      await AssualtEvents.create({
        appear_remain: Date.now(),
        disappear_remain: Date.now() + THIRTY_DAYS_MS,
        end_remain: Date.now() + THIRTY_DAYS_MS,
        start_remain: Date.now(),
        ...event,
      });
    }
    log.info('Assualt Event Data imported successfully.');
  } else {
    log.info('Assualt Event Data is not empty. Skipping import.');
  }
}

async function seedScoreEvents(log: Logger): Promise<void> {
  const count = await ScoreEvents.countDocuments({});
  log.info(`Number of Score Events: ${count}`);
  if (count == 0) {
    for (const coevEvent of coevEvents) {
      await ScoreEvents.create({
        end_remain: Date.now() + THIRTY_DAYS_MS,
        start_remain: Date.now(),
        ...coevEvent,
      });
    }
    log.info('Score Event Data imported successfully.');
  } else {
    log.info('Score Event Data is not empty. Skipping import.');
  }
}

async function seedTicketEvents(log: Logger): Promise<void> {
  const count = await TicketEvents.countDocuments({});
  log.info(`Number of Ticket Events: ${count}`);
  if (count == 0) {
    for (const ticketEvent of ticketEvents) {
      await TicketEvents.create({
        buy_end_remain: Date.now() + THIRTY_DAYS_MS,
        buy_start_remain: Date.now() + THIRTY_DAYS_MS,
        clear_time: 0,
        end_remain: Date.now() + THIRTY_DAYS_MS,
        start_remain: Date.now(),
        ...ticketEvent,
      });
    }
    log.info('Ticket Event Data imported successfully.');
  } else {
    log.info('Ticket Event Data is not empty. Skipping import.');
  }
}

async function seedQuestSheets(log: Logger): Promise<void> {
  const count = await QuestSheet.countDocuments({});
  log.info(`Number of Quests: ${count}`);
  if (count === 0) {
    await QuestSheet.insertMany(typedNormal.rQuestSheet.mQuestDataList);
    await QuestSheet.insertMany(typedTraining.rQuestSheet.mQuestDataList);
    await QuestSheet.insertMany(typedScore.rQuestSheet.mQuestDataList);
    await QuestSheet.insertMany(typedEternal.rQuestSheet.mQuestDataList);
    await QuestSheet.insertMany(typedTicket.rQuestSheet.mQuestDataList);
    await QuestSheet.insertMany(typedEvent.rQuestSheet.mQuestDataList);
    log.info('Quest Data imported successfully.');
  } else {
    log.info('Quest Data is not empty. Skipping import.');
  }
}

export async function seedDatabase(log: Logger): Promise<void> {
  await seedEvents(log);
  await seedAssaultEvents(log);
  await seedScoreEvents(log);
  await seedTicketEvents(log);
  await seedQuestSheets(log);
}
