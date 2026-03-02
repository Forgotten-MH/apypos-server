import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../services/crypto/encryptionHelpers');

import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import {
  pushRegister,
  pushSetting,
  pushModify,
} from './caplink.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('caplink.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('pushRegister', () => {
    it('returns result 0', () => {
      const { req, res } = mockReqRes();
      pushRegister(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        { result: 0 },
        res,
        req,
      );
    });
  });

  describe('pushSetting', () => {
    it('returns push setting flags', () => {
      const { req, res } = mockReqRes();
      pushSetting(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          push_setting: expect.objectContaining({
            all: 0,
            app: 0,
            chat: 0,
            frnd: 0,
            game: 0,
          }),
        }),
        res,
        req,
      );
    });
  });

  describe('pushModify', () => {
    it('returns result 0', () => {
      const { req, res } = mockReqRes();
      pushModify(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        { result: 0 },
        res,
        req,
      );
    });
  });
});
