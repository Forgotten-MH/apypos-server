import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../services/crypto/encryptionHelpers');

import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { list } from './ticket.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('ticket.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('list', () => {
    it('returns ticket list with purchase info', () => {
      const { req, res } = mockReqRes();
      list(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          ticket_list: expect.arrayContaining([
            expect.objectContaining({
              mst_limited_id: 581393666,
              buy_enabled: 1,
              price: 2,
              stock: 1,
            }),
          ]),
        }),
        res,
        req,
      );
    });
  });
});
