import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../model/user');
vi.mock('../../../services/boxService');
vi.mock('../../../services/crypto/encryptionHelpers');
vi.mock('../story/story.controller', () => ({
  updatePartNoteState: vi.fn(),
}));
vi.mock('../../../middleware/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  }),
}));

import User from '../../../model/user.js';
import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { ERROR_CODE } from '../../../constants/error.codes.js';
import {
  getTutorialFlag,
  nyankenList,
  nyankenGo,
  nyankenResult,
  TutorialFlagSet,
  TutorialQuestStart,
  stepUP,
  TutorialQuestEnd,
} from './tutorial.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('tutorial.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getTutorialFlag', () => {
    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'bad' });
      await getTutorialFlag(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('returns tutorial flags on success', async () => {
      vi.mocked(User.findOne).mockResolvedValue({ tutorial_flags: [110, 210] } as never);
      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await getTutorialFlag(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({ flags: [110, 210] }, res, req);
    });
  });

  describe('nyankenList', () => {
    it('returns quest data list', () => {
      const { req, res } = mockReqRes({});
      nyankenList(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          questDataList: expect.arrayContaining([
            expect.objectContaining({ mst_nyanken_id: 2022298312, sequence_no: 4 }),
          ]),
        }),
        res,
        req,
      );
    });
  });

  describe('nyankenGo', () => {
    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(User.findOneAndUpdate).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'bad' });
      await nyankenGo(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('returns nyanken data with updated tutorial step', async () => {
      vi.mocked(User.findOneAndUpdate).mockResolvedValue({ tutorial_step: 6010 });
      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await nyankenGo(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ mst_nyanken_id: 2022298312, tutorial_step: 6010 }),
        res,
        req,
      );
    });
  });

  describe('nyankenResult', () => {
    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(User.findOneAndUpdate).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'bad' });
      await nyankenResult(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('returns reward data on success', async () => {
      vi.mocked(User.findOneAndUpdate).mockResolvedValue({ tutorial_step: 7010, box: { equipments: [] } });
      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await nyankenResult(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          effect_id: 42,
          tutorial_step: 7010,
          result_list: expect.objectContaining({
            equipments: expect.arrayContaining([
              expect.objectContaining({ equipment_id: 'WD_AXE103' }),
            ]),
          }),
        }),
        res,
        req,
      );
    });
  });

  describe('TutorialFlagSet', () => {
    it('returns NOT_AUTHENTICATED when user not found on first lookup', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'bad', flags: [110] });
      await TutorialFlagSet(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('appends flags and returns updated list', async () => {
      vi.mocked(User.findOne).mockResolvedValue({ tutorial_flags: [110] } as never);
      vi.mocked(User.findOneAndUpdate).mockResolvedValue({ tutorial_flags: [110, 210] });
      const { req, res } = mockReqRes({ session_id: 'sess-1', flags: [210] });
      await TutorialFlagSet(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({ flags: [110, 210] }, res, req);
    });
  });

  describe('TutorialQuestStart', () => {
    it('returns quest instance data', () => {
      const { req, res } = mockReqRes({ mst_quest_id: 999 });
      TutorialQuestStart(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          instance_data: expect.objectContaining({
            mst_quest_id: 999,
            block_list: expect.any(Array),
          }),
        }),
        res,
        req,
      );
    });

    it('uses default quest ID when not provided', () => {
      const { req, res } = mockReqRes({});
      TutorialQuestStart(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          instance_data: expect.objectContaining({ mst_quest_id: 1778018296 }),
        }),
        res,
        req,
      );
    });
  });

  describe('stepUP', () => {
    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'bad' });
      await stepUP(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('advances tutorial step 110 to 210', async () => {
      vi.mocked(User.findOne).mockResolvedValue({ tutorial_step: 110 } as never);
      vi.mocked(User.findOneAndUpdate).mockResolvedValue({ tutorial_step: 210 });
      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await stepUP(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ tutorial_step: 210 }),
        res,
        req,
      );
    });

    it('advances tutorial step 7010 to 0xFFFF', async () => {
      vi.mocked(User.findOne).mockResolvedValue({ tutorial_step: 7010 } as never);
      vi.mocked(User.findOneAndUpdate).mockResolvedValue({ tutorial_step: 0xffff });
      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await stepUP(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ tutorial_step: 0xffff }),
        res,
        req,
      );
    });
  });

  describe('TutorialQuestEnd', () => {
    it('returns NOT_AUTHENTICATED when user not found on first lookup', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'bad' });
      await TutorialQuestEnd(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('returns rewards and updates tutorial step on success', async () => {
      const mockDoc = {
        ocean_list: [],
        box: { materials: [] },
        tutorial_step: 5010,
      };
      vi.mocked(User.findOne).mockResolvedValue(mockDoc as never);
      vi.mocked(User.findOneAndUpdate)
        .mockResolvedValueOnce({ ...mockDoc, tutorial_step: 5010 }) // step update
        .mockResolvedValueOnce({ ...mockDoc }); // box update
      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await TutorialQuestEnd(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          tutorial_step: 5010,
          tutorial_rewards: expect.objectContaining({
            tutorial_zeny: 100,
            tutorial_normal_reward: expect.objectContaining({
              item_list: expect.objectContaining({ materials: expect.any(Array) }),
            }),
          }),
          otomo_result: expect.arrayContaining([
            expect.objectContaining({ mst_otomo_id: 2092467563 }),
          ]),
        }),
        res,
        req,
      );
    });
  });
});
