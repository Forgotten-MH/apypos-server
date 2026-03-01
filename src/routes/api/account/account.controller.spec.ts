import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../model/user');
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
import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { ERROR_CODE, ERROR_CATEGORY } from '../../../constants/error.codes.js';
import { registerAccount, loginAccount, migrationReady, migrationAuth } from './account.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('account.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('registerAccount', () => {
    it('creates a new user and calls encryptAndSend on success', async () => {
      User.prototype.save = vi.fn().mockResolvedValue(undefined);

      const { req, res } = mockReqRes({
        uu_id: 'test-uuid',
        secret_id: 'test-secret',
        session_id: 'sess-1',
      });

      await registerAccount(req, res);

      expect(User.prototype.save).toHaveBeenCalled();
      // encryptAndSend is called with response data (properties are undefined in mock
      // since auto-mock constructor doesn't assign fields, but the call itself is verified)
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          is_review: 0,
          stretch_effect_info: expect.any(Object),
        }),
        res,
        req,
      );
    });

    it('returns error when save fails', async () => {
      User.prototype.save = vi.fn().mockRejectedValue(new Error('DB error'));

      const { req, res } = mockReqRes({
        uu_id: 'test-uuid',
        secret_id: 'test-secret',
      });

      await registerAccount(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        {},
        res,
        req,
        1,
        2,
        'Account registration failed',
      );
    });
  });

  describe('loginAccount', () => {
    it('logs in an existing user with matching credentials', async () => {
      const mockUser = {
        uu_id: 'test-uuid',
        secret_id: 'test-secret',
        game_id: 'GAME1234',
        user_id: 'USER123',
        tutorial_step: 210,
        model_info: { gender: 0 },
      };
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      vi.mocked(User.findOneAndUpdate).mockResolvedValue(mockUser as never);

      const { req, res } = mockReqRes({
        uu_id: 'test-uuid',
        secret_id: 'test-secret',
        session_id: 'sess-1',
      });

      await loginAccount(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          game_id: 'GAME1234',
          user_id: 'USER123',
          tutorial_step: 210,
        }),
        res,
        req,
      );
    });

    it('returns 4004 when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);

      const { req, res } = mockReqRes({
        uu_id: 'nonexistent',
        secret_id: 'secret',
      });

      await loginAccount(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.LOGIN_FAILED);
    });

    it('returns 2004 when secret_id does not match', async () => {
      vi.mocked(User.findOne).mockResolvedValue({
        secret_id: 'correct-secret',
      } as never);

      const { req, res } = mockReqRes({
        uu_id: 'test-uuid',
        secret_id: 'wrong-secret',
      });

      await loginAccount(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('returns error when DB throws', async () => {
      vi.mocked(User.findOne).mockRejectedValue(new Error('DB error'));

      const { req, res } = mockReqRes({
        uu_id: 'test-uuid',
        secret_id: 'test-secret',
      });

      await loginAccount(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.GENERIC_ERROR, ERROR_CATEGORY.ERROR_DIALOG, 'Login failed');
    });
  });

  describe('migrationReady', () => {
    it('updates migration data and returns migration_id', async () => {
      vi.mocked(User.findOneAndUpdate).mockResolvedValue({
        transfer: { migration_id: 'MIG12345' },
      } as never);

      const { req, res } = mockReqRes({
        login_id: 'LOGIN123',
        secret_id: 'secret',
        mst_himitsu_question_id: 'q1',
        himitsu_answer: 'answer',
        migration_pass: 'pass123',
      });

      await migrationReady(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ migration_id: 'MIG12345' }),
        res,
        req,
      );
    });

    it('returns 4004 when user not found', async () => {
      vi.mocked(User.findOneAndUpdate).mockResolvedValue(null);

      const { req, res } = mockReqRes({
        login_id: 'bad',
        secret_id: 'bad',
      });

      await migrationReady(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.LOGIN_FAILED);
    });
  });

  describe('migrationAuth', () => {
    it('authenticates migration and returns login credentials', async () => {
      vi.mocked(User.findOneAndUpdate).mockResolvedValue({
        login_id: 'LOGIN123',
        user_id: 'USER456',
      } as never);

      const { req, res } = mockReqRes({
        migration_id: 'MIG123',
        migration_pass: 'pass',
        secret_id: 'new-secret',
        uu_id: 'new-uuid',
      });

      await migrationAuth(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          login_id: 'LOGIN123',
          user_id: 'USER456',
        }),
        res,
        req,
      );
    });

    it('returns 4004 when migration credentials are wrong', async () => {
      vi.mocked(User.findOneAndUpdate).mockResolvedValue(null);

      const { req, res } = mockReqRes({
        migration_id: 'bad',
        migration_pass: 'bad',
      });

      await migrationAuth(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.LOGIN_FAILED);
    });
  });
});
