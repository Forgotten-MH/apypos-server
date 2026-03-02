import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../services/crypto/encryptionHelpers');

import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { nothing } from './check.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('check.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('nothing', () => {
    it('returns game version id', () => {
      const { req, res } = mockReqRes();
      nothing(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        { game_id: '09.03.06' },
        res,
        req,
      );
    });
  });
});
