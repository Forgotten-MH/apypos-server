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
import { otomoteamGet, otomoteamSet, otomoteamSelect } from './userOtomoTeam.controller';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('userOtomoTeam.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('otomoteamGet', () => {
    it('returns otomo team data', async () => {
      vi.mocked(User.findOne).mockResolvedValue({
        otomoteam: {
          capacity: 3,
          otomo_team: [{ index: 1, otomo_ids: ['OT_001', 'OT_002'] }],
          selected_index: 1,
        },
      } as never);

      const { req, res } = mockReqRes({ session_id: 'sess-1' });

      await otomoteamGet(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          capacity: 3,
          selected_index: 1,
        }),
        res,
        req,
      );
    });

    it('returns 2004 when otomoteam is missing', async () => {
      vi.mocked(User.findOne).mockResolvedValue({
        otomoteam: null,
      } as never);

      const { req, res } = mockReqRes({ session_id: 'sess-1' });

      await otomoteamGet(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, 2004);
    });

    it('returns error on DB failure', async () => {
      vi.mocked(User.findOne).mockRejectedValue(new Error('DB error'));

      const { req, res } = mockReqRes({ session_id: 'sess-1' });

      await otomoteamGet(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, 1, 2, 'Get otomo team failed');
    });
  });

  describe('otomoteamSet', () => {
    it('updates an existing otomo team', async () => {
      const existingTeam = { index: 1, otomo_ids: ['OT_001', 'OT_002'] };
      const mockDoc = {
        otomoteam: {
          capacity: 3,
          otomo_team: [existingTeam],
          selected_index: 1,
        },
        save: vi.fn().mockResolvedValue(undefined),
      };
      vi.mocked(User.findOne).mockResolvedValue(mockDoc as never);

      const newTeam = { index: 1, otomo_ids: ['OT_003', 'OT_004'] };
      const { req, res } = mockReqRes({
        session_id: 'sess-1',
        otomo_teams: [newTeam],
      });

      await otomoteamSet(req, res);

      expect(mockDoc.save).toHaveBeenCalled();
      expect(mockDoc.otomoteam.otomo_team[0]).toEqual(newTeam);
      expect(encryptAndSend).toHaveBeenCalled();
    });

    it('pushes a new otomo team when index not found', async () => {
      const mockDoc = {
        otomoteam: {
          capacity: 3,
          otomo_team: [{ index: 1, otomo_ids: ['OT_001'] }],
          selected_index: 1,
        },
        save: vi.fn().mockResolvedValue(undefined),
      };
      vi.mocked(User.findOne).mockResolvedValue(mockDoc as never);

      const newTeam = { index: 2, otomo_ids: ['OT_003', 'OT_004'] };
      const { req, res } = mockReqRes({
        session_id: 'sess-1',
        otomo_teams: [newTeam],
      });

      await otomoteamSet(req, res);

      expect(mockDoc.otomoteam.otomo_team).toHaveLength(2);
    });
  });

  describe('otomoteamSelect', () => {
    it('selects an otomo team index', async () => {
      vi.mocked(User.findOne).mockResolvedValue({
        otomoteam: {
          capacity: 3,
          otomo_team: [],
          selected_index: 1,
        },
      } as never);
      vi.mocked(User.findOneAndUpdate).mockResolvedValue({
        otomoteam: { selected_index: 2 },
      } as never);

      const { req, res } = mockReqRes({
        session_id: 'sess-1',
        index: 2,
      });

      await otomoteamSelect(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ selected_index: 2 }),
        res,
        req,
      );
    });

    it('returns 2004 when otomoteam is missing', async () => {
      vi.mocked(User.findOne).mockResolvedValue({
        otomoteam: null,
      } as never);

      const { req, res } = mockReqRes({
        session_id: 'sess-1',
        index: 1,
      });

      await otomoteamSelect(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, 2004);
    });
  });
});
