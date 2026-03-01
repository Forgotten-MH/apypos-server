import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../../model/user');
vi.mock('../../../../services/crypto/encryptionHelpers');
vi.mock('../../../../middleware/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  }),
}));

import User from '../../../../model/user';
import { encryptAndSend } from '../../../../services/crypto/encryptionHelpers';
import { modelCreate, modelSet } from './userModel.controller';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('userModel.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('modelCreate', () => {
    it('creates model and returns model_info with tutorial_step 210', async () => {
      const mockModelInfo = { face: 1, gender: 0, hair: 2 };
      vi.mocked(User.findOneAndUpdate).mockResolvedValue({
        model_info: mockModelInfo,
        tutorial_step: 210,
      } as never);

      const { req, res } = mockReqRes({
        session_id: 'sess-1',
        model_info: mockModelInfo,
      });

      await modelCreate(req, res);

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { current_session: 'sess-1' },
        { model_info: mockModelInfo, tutorial_step: 210 },
        { new: true },
      );
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          model_info: mockModelInfo,
          tutorial_step: 210,
        }),
        res,
        req,
      );
    });

    it('returns 2004 when user not found', async () => {
      vi.mocked(User.findOneAndUpdate).mockResolvedValue(null);

      const { req, res } = mockReqRes({
        session_id: 'bad',
        model_info: {},
      });

      await modelCreate(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, 2004);
    });

    it('returns error on DB failure', async () => {
      vi.mocked(User.findOneAndUpdate).mockRejectedValue(new Error('fail'));

      const { req, res } = mockReqRes({
        session_id: 'sess-1',
        model_info: {},
      });

      await modelCreate(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, 1, 2, 'Model create failed');
    });
  });

  describe('modelSet', () => {
    it('updates model info', async () => {
      const mockModelInfo = { face: 2, gender: 1, hair: 3 };
      vi.mocked(User.findOneAndUpdate).mockResolvedValue({
        model_info: mockModelInfo,
      } as never);

      const { req, res } = mockReqRes({
        session_id: 'sess-1',
        model_info: mockModelInfo,
      });

      await modelSet(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ model_info: mockModelInfo }),
        res,
        req,
      );
    });

    it('normalizes gender -1 to 0', async () => {
      const inputModel = { face: 1, gender: -1, hair: 2 };
      vi.mocked(User.findOneAndUpdate).mockResolvedValue({
        model_info: { ...inputModel, gender: 0 },
      } as never);

      const { req, res } = mockReqRes({
        session_id: 'sess-1',
        model_info: inputModel,
      });

      await modelSet(req, res);

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { current_session: 'sess-1' },
        { model_info: expect.objectContaining({ gender: 0 }) },
        { new: true },
      );
    });
  });
});
