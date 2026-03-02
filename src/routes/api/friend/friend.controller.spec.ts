import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../services/crypto/encryptionHelpers');

import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { capacityInfo } from './friend.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('friend.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('capacityInfo', () => {
    it('returns max, now, and price', () => {
      const { req, res } = mockReqRes();
      capacityInfo(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        { max: 100, now: 0, price: 0 },
        res,
        req,
      );
    });
  });
});
