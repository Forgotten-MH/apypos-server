import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../model/user');
vi.mock('../../../services/crypto/encryptionHelpers');
vi.mock('../../../services/defineService');
vi.mock('../../../middleware/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  }),
}));

import User from '../../../model/user';
import { encryptAndSend } from '../../../services/crypto/encryptionHelpers';
import {
  get,
  otomoGet,
  equipLevelup,
  storageInfo,
  sale,
  favoriteSet,
} from './box.controller';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('box.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('get', () => {
    it('returns box data for authenticated user', async () => {
      const mockBox = { equipments: [], monument: { hr: 1 } };
      vi.mocked(User.findOne).mockResolvedValue({
        box: mockBox,
      } as never);

      const { req, res } = mockReqRes({ session_id: 'sess-1' });

      await get(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ box: mockBox }),
        res,
        req,
      );
    });

    it('returns 2004 when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);

      const { req, res } = mockReqRes({ session_id: 'bad-sess' });

      await get(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, 2004);
    });

    it('returns error on DB failure', async () => {
      vi.mocked(User.findOne).mockRejectedValue(new Error('DB error'));

      const { req, res } = mockReqRes({ session_id: 'sess-1' });

      await get(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        {},
        res,
        req,
        1,
        2,
        'Get box failed',
      );
    });
  });

  describe('otomoGet', () => {
    it('returns otomos from user box', async () => {
      const mockOtomos = [{ otomo_id: 'OT_001', mst_otomo_id: 123 }];
      vi.mocked(User.findOne).mockResolvedValue({
        box: { otomos: mockOtomos },
      } as never);

      const { req, res } = mockReqRes({ session_id: 'sess-1' });

      await otomoGet(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ otomos: mockOtomos }),
        res,
        req,
      );
    });

    it('returns error when box is missing', async () => {
      vi.mocked(User.findOne).mockResolvedValue({ box: null } as never);

      const { req, res } = mockReqRes({ session_id: 'sess-1' });

      await otomoGet(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        {},
        res,
        req,
        1,
        2,
        'Box not found',
      );
    });
  });

  describe('equipLevelup', () => {
    it('levels up equipment by the specified amount', async () => {
      const mockEquipments = [
        { equipment_id: 'EQP_001', elv: 3, mst_equipment_id: 123 },
      ];
      vi.mocked(User.findOne).mockResolvedValue({
        id: 'user-1',
        box: { equipments: mockEquipments },
      } as never);
      vi.mocked(User.findByIdAndUpdate).mockResolvedValue(null);

      const { req, res } = mockReqRes({
        session_id: 'sess-1',
        eqp_obj_id: 'EQP_001',
        num: 5,
      });

      await equipLevelup(req, res);

      expect(mockEquipments[0].elv).toBe(8);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          levelup: { equipment: expect.objectContaining({ elv: 8 }) },
        }),
        res,
        req,
      );
    });

    it('returns error when equipment not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue({
        id: 'user-1',
        box: { equipments: [] },
      } as never);

      const { req, res } = mockReqRes({
        session_id: 'sess-1',
        eqp_obj_id: 'MISSING',
      });

      await equipLevelup(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        {},
        res,
        req,
        2001,
        0,
        'equipment not found',
      );
    });
  });

  describe('storageInfo', () => {
    it('returns static storage info', () => {
      const { req, res } = mockReqRes();

      storageInfo(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          storage_info: expect.objectContaining({
            storage_limit: 5,
            storage_num: 1,
          }),
        }),
        res,
        req,
      );
    });
  });

  describe('sale', () => {
    it('returns sale response data', async () => {
      const { req, res } = mockReqRes({
        eqp_obj_ids: ['EQP_001'],
      });

      await sale(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          equip_sell: expect.objectContaining({
            zeny: 750000,
          }),
        }),
        res,
        req,
      );
    });
  });

  describe('favoriteSet', () => {
    it('returns equipment with favorite flag set', async () => {
      const { req, res } = mockReqRes({
        is_favorite: 1,
        eqp_obj_id: 'EQP_001',
      });

      await favoriteSet(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          favorite_set: expect.objectContaining({
            equipment: expect.objectContaining({
              equipment_id: 'EQP_001',
              favorite: 1,
            }),
          }),
        }),
        res,
        req,
      );
    });
  });
});
