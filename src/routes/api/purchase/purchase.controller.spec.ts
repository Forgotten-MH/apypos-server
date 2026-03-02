import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../services/crypto/encryptionHelpers');

import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { purchaseList } from './purchase.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('purchase.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('purchaseList', () => {
    it('returns products, offer products, and bonus stamp info', () => {
      const { req, res } = mockReqRes();
      purchaseList(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'test',
          rest: 1,
          products: expect.arrayContaining([
            expect.objectContaining({ id: '1', state: 1 }),
          ]),
          offer_products: expect.arrayContaining([
            expect.objectContaining({ id: '1', name: 'name' }),
          ]),
          bonus_stamp_info: expect.arrayContaining([
            expect.objectContaining({ mst_stamp_set_id: 0 }),
          ]),
        }),
        res,
        req,
      );
    });
  });
});
