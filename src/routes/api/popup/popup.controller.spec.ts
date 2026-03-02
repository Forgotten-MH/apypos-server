import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../services/crypto/encryptionHelpers');

import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { record } from './popup.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('popup.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('record', () => {
    it('returns empty object', () => {
      const { req, res } = mockReqRes();
      record(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        {},
        res,
        req,
      );
    });
  });
});
