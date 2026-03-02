import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../model/user');
vi.mock('../../../model/presents');
vi.mock('../../../services/crypto/encryptionHelpers');
vi.mock('../../../middleware/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  }),
}));

import User from '../../../model/user.js';
import Present from '../../../model/presents.js';
import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { ERROR_CODE, ERROR_CATEGORY } from '../../../constants/error.codes.js';
import { trainingEnd, trainingStart, trainingList } from './questTraining.controller.js';
import { calcMstId } from '../../../services/defineService.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('questTraining.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('trainingStart', () => {
    it('returns instance data with quest id', () => {
      const questId = calcMstId('TRAINING00001');
      const { req, res } = mockReqRes({ mst_quest_id: questId });
      trainingStart(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          instance_data: expect.objectContaining({
            mst_quest_id: questId,
            block_list: expect.arrayContaining([
              expect.objectContaining({ block_idx: 1 }),
              expect.objectContaining({ block_idx: 2 }),
            ]),
          }),
        }),
        res,
        req,
      );
    });
  });

  describe('trainingEnd', () => {
    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({
        mst_quest_id: calcMstId('TRAINING00001'),
        clear_time: 30,
        session_id: 'bad',
      });
      await trainingEnd(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('inserts cleared quest and saves present on success', async () => {
      vi.mocked(User.findOne).mockResolvedValue({
        uu_id: 'user-1',
        cleared_quests: [],
      } as never);
      vi.mocked(User.findOneAndUpdate).mockResolvedValue({} as never);

      const questId = calcMstId('TRAINING00001');
      const { req, res } = mockReqRes({
        mst_quest_id: questId,
        clear_time: 45,
        session_id: 'sess-1',
      });
      await trainingEnd(req, res);

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { current_session: 'sess-1' },
        { cleared_quests: [{ mst_quest_id: questId, clear_time: 45 }] },
        { new: true },
      );
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          mst_quest_id: questId,
          pop_list: expect.arrayContaining([
            expect.objectContaining({
              item_list: expect.objectContaining({
                equipments: [expect.objectContaining({ equipment_id: 'WD_SWORD002' })],
              }),
            }),
          ]),
        }),
        res,
        req,
      );
    });

    it('returns error on DB failure', async () => {
      vi.mocked(User.findOne).mockRejectedValue(new Error('fail'));
      const { req, res } = mockReqRes({
        mst_quest_id: calcMstId('TRAINING00001'),
        clear_time: 30,
        session_id: 'sess-1',
      });
      await trainingEnd(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        {},
        res,
        req,
        ERROR_CODE.GENERIC_ERROR,
        ERROR_CATEGORY.ERROR_DIALOG,
        'Training end failed',
      );
    });
  });

  describe('trainingList', () => {
    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'bad' });
      await trainingList(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('returns training list with is_clear flags', async () => {
      const questId = calcMstId('TRAINING00001');
      vi.mocked(User.findOne).mockResolvedValue({
        cleared_quests: [{ mst_quest_id: questId }],
      } as never);
      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await trainingList(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          training_list: expect.arrayContaining([
            expect.objectContaining({
              mst_quest_id: questId,
              is_clear: 1,
              reward_text: 'Sword & Shield',
            }),
          ]),
        }),
        res,
        req,
      );
    });

    it('returns error on DB failure', async () => {
      vi.mocked(User.findOne).mockRejectedValue(new Error('fail'));
      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await trainingList(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        {},
        res,
        req,
        ERROR_CODE.GENERIC_ERROR,
        ERROR_CATEGORY.ERROR_DIALOG,
        'Training list failed',
      );
    });
  });
});
