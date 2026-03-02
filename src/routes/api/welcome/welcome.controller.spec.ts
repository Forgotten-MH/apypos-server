import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../services/crypto/encryptionHelpers');

import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { getSafetyFlag, getSafetyCheck } from './welcome.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('welcome.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getSafetyFlag', () => {
    it('returns flag set to 1', () => {
      const { req, res } = mockReqRes();
      getSafetyFlag(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        { flag: 1 },
        res,
        req,
      );
    });
  });

  describe('getSafetyCheck', () => {
    it('returns empty object', () => {
      const { req, res } = mockReqRes();
      getSafetyCheck(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        {},
        res,
        req,
      );
    });
  });
});
