import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../model/user');
vi.mock('../../../model/questSheet');
vi.mock('../../../model/events/eventMeta');
vi.mock('../../../model/events/assualts');
vi.mock('../../../model/events/m16');
vi.mock('../../../model/events/score');
vi.mock('../../../model/events/standing');
vi.mock('../../../model/events/tickets');
vi.mock('../../../model/events/tour');
vi.mock('../../../model/events/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../model/events/utils.js')>();
  return {
    ...actual,
    enrichEvent: vi.fn((data: unknown) => data),
  };
});
vi.mock('../../../services/crypto/encryptionHelpers');
vi.mock('../../../middleware/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  }),
}));
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}));

import User from '../../../model/user.js';
import QuestSheet from '../../../model/questSheet.js';
import { Event } from '../../../model/events/index.js';
import AssualtEvents from '../../../model/events/assualts.js';
import M16Events from '../../../model/events/m16.js';
import ScoreEvents from '../../../model/events/score.js';
import StandingEvents from '../../../model/events/standing.js';
import TicketEvents from '../../../model/events/tickets.js';
import TourEvents from '../../../model/events/tour.js';
import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { ERROR_CODE, ERROR_CATEGORY } from '../../../constants/error.codes.js';
import { questProgress, questResultEnd, eternalStart, eternalAll } from './quest.controller.js';
import { eventTicketFree, eventNormalStart, eventTicketStart, eventScoreStart, eventListAll } from './questEvent.controller.js';
import { islandStart, islandEnd, islandMapAll } from './questIsland.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('quest.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('questProgress', () => {
    it('returns progress data with is_progress -1', () => {
      const { req, res } = mockReqRes({});
      questProgress(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ is_progress: -1, mst_quest_id: 0 }),
        res,
        req,
      );
    });
  });

  describe('questResultEnd', () => {
    it('returns empty data', () => {
      const { req, res } = mockReqRes({});
      questResultEnd(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req);
    });
  });

  describe('eventTicketFree', () => {
    it('returns ticket free info', () => {
      const { req, res } = mockReqRes({});
      eventTicketFree(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          infos: expect.arrayContaining([
            expect.objectContaining({ free_group_id: 1, max_free_count: 10 }),
          ]),
        }),
        res,
        req,
      );
    });
  });

  describe('eventNormalStart', () => {
    it('returns QUEST_INFO_FAILED when quest has no blocks', async () => {
      vi.mocked(QuestSheet.findOne).mockResolvedValue({ mBlocks: [] } as never);
      const { req, res } = mockReqRes({ mst_quest_id: 123 });
      await eventNormalStart(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.QUEST_INFO_FAILED);
    });

    it('returns QUEST_INFO_FAILED when quest not found', async () => {
      vi.mocked(QuestSheet.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({ mst_quest_id: 123 });
      await eventNormalStart(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.QUEST_INFO_FAILED);
    });

    it('returns instance data with block_list on success', async () => {
      vi.mocked(QuestSheet.findOne).mockResolvedValue({ mBlocks: [100, 200] } as never);
      const { req, res } = mockReqRes({ mst_quest_id: 999 });
      await eventNormalStart(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          instance_data: expect.objectContaining({
            mst_quest_id: 999,
            block_list: expect.arrayContaining([
              expect.objectContaining({ block_idx: 1, mst_block_id: 100 }),
              expect.objectContaining({ block_idx: 2, mst_block_id: 200 }),
            ]),
          }),
        }),
        res,
        req,
      );
    });

    it('returns error on DB failure', async () => {
      vi.mocked(QuestSheet.findOne).mockRejectedValue(new Error('DB error'));
      const { req, res } = mockReqRes({ mst_quest_id: 123 });
      await eventNormalStart(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        {},
        res,
        req,
        ERROR_CODE.GENERIC_ERROR,
        ERROR_CATEGORY.ERROR_DIALOG,
        'Event normal start failed',
      );
    });
  });

  describe('eventTicketStart', () => {
    it('returns QUEST_INFO_FAILED when quest not found', async () => {
      vi.mocked(QuestSheet.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({ mst_quest_id: 123 });
      await eventTicketStart(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.QUEST_INFO_FAILED);
    });

    it('populates block_list from quest blocks', async () => {
      vi.mocked(QuestSheet.findOne).mockResolvedValue({ mBlocks: [300] } as never);
      const { req, res } = mockReqRes({ mst_quest_id: 500 });
      await eventTicketStart(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          instance_data: expect.objectContaining({
            block_list: [expect.objectContaining({ block_idx: 1, mst_block_id: 300 })],
          }),
        }),
        res,
        req,
      );
    });
  });

  describe('eventScoreStart', () => {
    it('returns QUEST_INFO_FAILED when quest not found', async () => {
      vi.mocked(QuestSheet.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({ mst_quest_id: 123 });
      await eventScoreStart(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.QUEST_INFO_FAILED);
    });

    it('returns instance data on success', async () => {
      vi.mocked(QuestSheet.findOne).mockResolvedValue({ mBlocks: [10, 20] } as never);
      const { req, res } = mockReqRes({ mst_quest_id: 777 });
      await eventScoreStart(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          instance_data: expect.objectContaining({ mst_quest_id: 777 }),
        }),
        res,
        req,
      );
    });
  });

  describe('eternalStart', () => {
    it('returns QUEST_INFO_FAILED when quest not found', async () => {
      vi.mocked(QuestSheet.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({ mst_quest_id: 123 });
      await eternalStart(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.QUEST_INFO_FAILED);
    });

    it('returns instance data with blocks on success', async () => {
      vi.mocked(QuestSheet.findOne).mockResolvedValue({ mBlocks: [50] } as never);
      const { req, res } = mockReqRes({ mst_quest_id: 2002926758 });
      await eternalStart(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          instance_data: expect.objectContaining({
            mst_quest_id: 2002926758,
            block_list: [expect.objectContaining({ mst_block_id: 50 })],
          }),
        }),
        res,
        req,
      );
    });
  });

  describe('eternalAll', () => {
    it('returns eternal nodes data', () => {
      const { req, res } = mockReqRes({});
      eternalAll(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          eternal_nodes: expect.arrayContaining([
            expect.objectContaining({ mst_eternal_node_id: 1 }),
          ]),
        }),
        res,
        req,
      );
    });
  });

  describe('eventListAll', () => {
    function mockEventExec(data: Record<string, unknown>) {
      return { exec: vi.fn().mockResolvedValue(data) };
    }
    function mockArrayExec(data: { toObject: () => unknown }[]) {
      return { exec: vi.fn().mockResolvedValue(data) };
    }

    it('returns event list data on success', async () => {
      const eventData = {
        toObject: () => ({
          big_node_order_array: [90000],
          next_day_start: 0,
          next_latest_node_infos: [],
          now_latest_node_info_remain: 0,
          now_latest_node_infos: [],
        }),
      };
      vi.mocked(Event.findOne).mockReturnValue(mockEventExec(eventData) as never);

      const emptyArray: never[] = [];
      vi.mocked(AssualtEvents.find).mockReturnValue(mockArrayExec(emptyArray) as never);
      vi.mocked(M16Events.find).mockReturnValue(mockArrayExec(emptyArray) as never);
      vi.mocked(ScoreEvents.find).mockReturnValue(mockArrayExec(emptyArray) as never);
      vi.mocked(StandingEvents.find).mockReturnValue(mockArrayExec(emptyArray) as never);
      vi.mocked(TicketEvents.find).mockReturnValue(mockArrayExec(emptyArray) as never);
      vi.mocked(TourEvents.find).mockReturnValue(mockArrayExec(emptyArray) as never);

      const { req, res } = mockReqRes({});
      await eventListAll(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          big_node_order_array: [90000],
          event_list: expect.objectContaining({
            assault: [],
            m16: [],
          }),
        }),
        res,
        req,
      );
    });

    it('returns error on DB failure', async () => {
      vi.mocked(Event.findOne).mockReturnValue({
        exec: vi.fn().mockRejectedValue(new Error('fail')),
      } as never);

      const { req, res } = mockReqRes({});
      await eventListAll(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        {},
        res,
        req,
        ERROR_CODE.GENERIC_ERROR,
        ERROR_CATEGORY.ERROR_DIALOG,
        'Event list failed',
      );
    });
  });

  describe('islandStart', () => {
    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      vi.mocked(QuestSheet.findOne).mockResolvedValue({ mBlocks: [1] } as never);
      const { req, res } = mockReqRes({ mst_quest_id: 100, session_id: 'bad' });
      await islandStart(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('returns QUEST_INFO_FAILED when quest has no blocks', async () => {
      vi.mocked(User.findOne).mockResolvedValue({ cleared_quests: [] } as never);
      vi.mocked(QuestSheet.findOne).mockResolvedValue(null);
      vi.mocked(User.findOneAndUpdate).mockResolvedValue({} as never);
      const { req, res } = mockReqRes({ mst_quest_id: 100, session_id: 'sess-1' });
      await islandStart(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.QUEST_INFO_FAILED);
    });

    it('adds quest to cleared_quests on first play', async () => {
      vi.mocked(User.findOne).mockResolvedValue({ cleared_quests: [] } as never);
      vi.mocked(QuestSheet.findOne).mockResolvedValue({ mBlocks: [10] } as never);
      vi.mocked(User.findOneAndUpdate).mockResolvedValue({} as never);
      const { req, res } = mockReqRes({ mst_quest_id: 100, session_id: 'sess-1' });
      await islandStart(req, res);

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { current_session: 'sess-1' },
        { cleared_quests: [{ mst_quest_id: 100 }] },
        { new: true },
      );
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          instance_data: expect.objectContaining({ mst_quest_id: 100 }),
        }),
        res,
        req,
      );
    });

    it('does not duplicate cleared_quests entry on replay', async () => {
      vi.mocked(User.findOne).mockResolvedValue({
        cleared_quests: [{ mst_quest_id: 100 }],
      } as never);
      vi.mocked(QuestSheet.findOne).mockResolvedValue({ mBlocks: [10] } as never);
      vi.mocked(User.findOneAndUpdate).mockResolvedValue({} as never);
      const { req, res } = mockReqRes({ mst_quest_id: 100, session_id: 'sess-1' });
      await islandStart(req, res);

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { current_session: 'sess-1' },
        { cleared_quests: [{ mst_quest_id: 100 }] },
        { new: true },
      );
    });
  });

  describe('islandEnd', () => {
    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(QuestSheet.findOne).mockResolvedValue(null);
      vi.mocked(User.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({
        mst_quest_id: 100,
        clear_time: 30,
        session_id: 'bad',
      });
      await islandEnd(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('inserts new cleared quest with clear_time', async () => {
      vi.mocked(QuestSheet.findOne).mockResolvedValue({ mRewardItemList: [] } as never);
      vi.mocked(User.findOne).mockResolvedValue({ cleared_quests: [] } as never);
      vi.mocked(User.findOneAndUpdate).mockResolvedValue({} as never);
      const { req, res } = mockReqRes({
        mst_quest_id: 200,
        clear_time: 45,
        session_id: 'sess-1',
      });
      await islandEnd(req, res);

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { current_session: 'sess-1' },
        { cleared_quests: [{ mst_quest_id: 200, clear_time: 45 }] },
        { new: true },
      );
    });

    it('updates clear_time for already cleared quest', async () => {
      vi.mocked(QuestSheet.findOne).mockResolvedValue({ mRewardItemList: [] } as never);
      vi.mocked(User.findOne).mockResolvedValue({
        cleared_quests: [{ mst_quest_id: 200, clear_time: 60 }],
      } as never);
      vi.mocked(User.findOneAndUpdate).mockResolvedValue({} as never);
      const { req, res } = mockReqRes({
        mst_quest_id: 200,
        clear_time: 30,
        session_id: 'sess-1',
      });
      await islandEnd(req, res);

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { current_session: 'sess-1' },
        { cleared_quests: [{ mst_quest_id: 200, clear_time: 30 }] },
        { new: true },
      );
    });

    it('returns reward data on success', async () => {
      vi.mocked(QuestSheet.findOne).mockResolvedValue({ mRewardItemList: [] } as never);
      vi.mocked(User.findOne).mockResolvedValue({ cleared_quests: [] } as never);
      vi.mocked(User.findOneAndUpdate).mockResolvedValue({} as never);
      const { req, res } = mockReqRes({
        mst_quest_id: 200,
        clear_time: 45,
        session_id: 'sess-1',
      });
      await islandEnd(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          rewards: expect.objectContaining({
            zeny: 30,
          }),
        }),
        res,
        req,
      );
    });

    it('returns error on DB failure', async () => {
      vi.mocked(QuestSheet.findOne).mockRejectedValue(new Error('fail'));
      const { req, res } = mockReqRes({
        mst_quest_id: 200,
        clear_time: 45,
        session_id: 'sess-1',
      });
      await islandEnd(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        {},
        res,
        req,
        ERROR_CODE.GENERIC_ERROR,
        ERROR_CATEGORY.ERROR_DIALOG,
        'Island end failed',
      );
    });
  });

  describe('islandMapAll', () => {
    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'bad' });
      await islandMapAll(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('returns error on DB failure', async () => {
      vi.mocked(User.findOne).mockRejectedValue(new Error('fail'));
      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await islandMapAll(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        {},
        res,
        req,
        ERROR_CODE.GENERIC_ERROR,
        ERROR_CATEGORY.ERROR_DIALOG,
        'Island map all failed',
      );
    });
  });
});
