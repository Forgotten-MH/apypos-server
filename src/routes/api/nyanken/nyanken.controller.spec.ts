import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../services/crypto/encryptionHelpers');

import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { progress, islandInfoGet, historyGet, QuestList } from './nyanken.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('nyanken.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('progress', () => {
    it('returns nyanken progress data', () => {
      const { req, res } = mockReqRes({});
      progress(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          balloon_color_id: 3,
          mst_nyanken_id: 2022298312,
          currency_ammount: 5,
        }),
        res,
        req,
      );
    });
  });

  describe('islandInfoGet', () => {
    it('returns island info with area rewards', () => {
      const { req, res } = mockReqRes({});
      islandInfoGet(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          area_info_list: expect.any(Array),
          area_reward_list: expect.arrayContaining([
            expect.objectContaining({ reward_id: 0 }),
          ]),
          mst_nyanken_id: 9116,
        }),
        res,
        req,
      );
    });
  });

  describe('historyGet', () => {
    it('returns history data with zeroed values', () => {
      const { req, res } = mockReqRes({});
      historyGet(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          mst_nyanken_id: 9116,
          balloon_color_id: 0,
          message_leaving: 'message_leaving',
          message_waiting: 'message_waiting',
        }),
        res,
        req,
      );
    });
  });

  describe('QuestList', () => {
    it('returns quest data list', () => {
      const { req, res } = mockReqRes({});
      QuestList(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          questDataList: expect.arrayContaining([
            expect.objectContaining({
              mst_nyanken_id: 9116,
              name: 'name',
            }),
          ]),
        }),
        res,
        req,
      );
    });
  });
});
