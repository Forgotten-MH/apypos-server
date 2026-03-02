import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../services/crypto/encryptionHelpers');
vi.mock('../../middleware/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

import { encryptAndSend } from '../../services/crypto/encryptionHelpers.js';
import {
  blankResponseEncrypted,
  blankResponse,
} from './notImplemented.controller.js';

function mockReqRes() {
  const req = { body: {}, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    header: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return { req, res };
}

describe('notImplemented.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('blankResponseEncrypted', () => {
    it('sends encrypted empty response', () => {
      const { req, res } = mockReqRes();
      blankResponseEncrypted(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req);
    });
  });

  describe('blankResponse', () => {
    it('sends plain JSON empty response', () => {
      const { req, res } = mockReqRes();
      blankResponse(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({});
    });
  });
});
