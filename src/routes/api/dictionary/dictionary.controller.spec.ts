import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../services/crypto/encryptionHelpers');

import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { getEquipment } from './dictionary.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('dictionary.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getEquipment', () => {
    it('returns a non-empty array of equipment IDs', () => {
      const { req, res } = mockReqRes({});
      getEquipment(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          mst_equipment_ids: expect.any(Array),
        }),
        res,
        req,
      );

      const data = vi.mocked(encryptAndSend).mock.calls[0]![0] as { mst_equipment_ids: number[] };
      expect(data.mst_equipment_ids.length).toBeGreaterThan(0);
    });

    it('contains only numbers in the equipment ID list', () => {
      const { req, res } = mockReqRes({});
      getEquipment(req, res);

      const data = vi.mocked(encryptAndSend).mock.calls[0]![0] as { mst_equipment_ids: number[] };
      expect(data.mst_equipment_ids.every((id) => typeof id === 'number')).toBe(true);
    });
  });
});
