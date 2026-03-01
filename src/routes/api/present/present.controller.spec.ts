import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../model/user');
vi.mock('../../../model/presents');
vi.mock('../../../services/boxService');
vi.mock('../../../services/crypto/encryptionHelpers');
vi.mock('../../../middleware/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  }),
}));

import User from '../../../model/user.js';
import Present from '../../../model/presents.js';
import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { ERROR_CODE, ERROR_CATEGORY } from '../../../constants/error.codes.js';
import { presentSync, presentReceive } from './present.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('present.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('presentSync', () => {
    it('returns presents for authenticated user', async () => {
      const mockPresents = [{ _id: 'p1', content: {} }];
      vi.mocked(User.findOne).mockResolvedValue({ uu_id: 'uid1' } as never);
      vi.mocked(Present.find).mockResolvedValue(mockPresents as never);

      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await presentSync(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ presentDetail: mockPresents }),
        res,
        req,
      );
    });

    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);

      const { req, res } = mockReqRes({ session_id: 'bad' });
      await presentSync(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('returns error on DB failure', async () => {
      vi.mocked(User.findOne).mockRejectedValue(new Error('DB fail'));

      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await presentSync(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        {},
        res,
        req,
        ERROR_CODE.GENERIC_ERROR,
        ERROR_CATEGORY.ERROR_DIALOG,
        'Present sync failed',
      );
    });
  });

  describe('presentReceive', () => {
    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);

      const { req, res } = mockReqRes({ session_id: 'bad', _ids: [] });
      await presentReceive(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('processes presents and returns receive count', async () => {
      const mockUser = { uu_id: 'uid1', box: { equipments: [] } };
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      vi.mocked(Present.find).mockResolvedValue([] as never);
      vi.mocked(User.updateOne).mockResolvedValue({} as never);

      const { req, res } = mockReqRes({ session_id: 'sess-1', _ids: ['p1'] });
      await presentReceive(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ receive_num: 0 }),
        res,
        req,
      );
    });

    it('returns error on DB failure', async () => {
      vi.mocked(User.findOne).mockRejectedValue(new Error('DB fail'));

      const { req, res } = mockReqRes({ session_id: 'sess-1', _ids: [] });
      await presentReceive(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        {},
        res,
        req,
        ERROR_CODE.GENERIC_ERROR,
        ERROR_CATEGORY.ERROR_DIALOG,
        'Present receive failed',
      );
    });
  });
});
