import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../../model/user');
vi.mock('../../../../services/crypto/encryptionHelpers');
vi.mock('../../../../middleware/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  }),
}));

import User from '../../../../model/user';
import { encryptAndSend } from '../../../../services/crypto/encryptionHelpers';
import {
  equipSetGet,
  equipSetSet,
  equipSetSocialGet,
  equipSetSocialSet,
} from './userEquipSet.controller';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('userEquipSet.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('equipSetGet', () => {
    it('returns equipset for authenticated user', async () => {
      const mockEquipset = {
        capacity_eqp_set: 5,
        equip_sets: [],
        selected_equip_set_index: 1,
      };
      vi.mocked(User.findOne).mockResolvedValue({
        equipset: mockEquipset,
      } as never);

      const { req, res } = mockReqRes({ session_id: 'sess-1' });

      await equipSetGet(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ capacity_eqp_set: 5 }),
        res,
        req,
      );
    });

    it('returns 2004 when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);

      const { req, res } = mockReqRes({ session_id: 'bad' });

      await equipSetGet(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, 2004);
    });

    it('returns error on DB failure', async () => {
      vi.mocked(User.findOne).mockRejectedValue(new Error('DB error'));

      const { req, res } = mockReqRes({ session_id: 'sess-1' });

      await equipSetGet(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, 1, 2, 'Get equip set failed');
    });
  });

  describe('equipSetSet', () => {
    it('updates equipset when equip_sets provided', async () => {
      const mockDoc = {
        id: 'user-1',
        equipset: {
          capacity_eqp_set: 5,
          equip_sets: [],
          selected_equip_set_index: 1,
        },
      };
      vi.mocked(User.findOne).mockResolvedValue(mockDoc as never);
      vi.mocked(User.findByIdAndUpdate).mockResolvedValue(null);

      const { req, res } = mockReqRes({
        session_id: 'sess-1',
        equip_sets: [{ index: 1 }],
        selected_equip_set_index: 2,
        capacity_eqp_set: 10,
      });

      await equipSetSet(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalled();
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ selected_equip_set_index: 2 }),
        res,
        req,
      );
    });

    it('returns 2004 when user has no equipset', async () => {
      vi.mocked(User.findOne).mockResolvedValue({
        equipset: null,
      } as never);

      const { req, res } = mockReqRes({ session_id: 'sess-1' });

      await equipSetSet(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, 2004);
    });
  });

  describe('equipSetSocialGet', () => {
    it('returns social equip sets', async () => {
      const mockSets = [{ is_used: 0, mst_partner_id: 0 }];
      vi.mocked(User.findOne).mockResolvedValue({
        social_equip_sets: mockSets,
      } as never);

      const { req, res } = mockReqRes({ session_id: 'sess-1' });

      await equipSetSocialGet(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ social_equip_sets: mockSets }),
        res,
        req,
      );
    });
  });

  describe('equipSetSocialSet', () => {
    it('updates social equip sets', async () => {
      const mockDoc = {
        id: 'user-1',
        social_equip_sets: [],
      };
      vi.mocked(User.findOne).mockResolvedValue(mockDoc as never);
      vi.mocked(User.findByIdAndUpdate).mockResolvedValue(null);

      const { req, res } = mockReqRes({
        session_id: 'sess-1',
        social_equip_sets: [{ is_used: 1, mst_partner_id: 507850012 }],
      });

      await equipSetSocialSet(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalled();
      expect(encryptAndSend).toHaveBeenCalled();
    });

    it('returns 2004 when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);

      const { req, res } = mockReqRes({ session_id: 'bad' });

      await equipSetSocialSet(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, 2004);
    });
  });
});
