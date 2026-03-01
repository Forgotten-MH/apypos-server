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
import {
  rename,
  get,
  commentSet,
  navigationNews,
  achievementNews,
  achievementAll,
  OfferCheck,
  titleSet,
} from './user.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('user.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('rename', () => {
    it('updates character name and returns it', async () => {
      vi.mocked(User.findOneAndUpdate).mockResolvedValue({
        character_name: 'NewName',
      } as never);

      const { req, res } = mockReqRes({
        name: 'NewName',
        session_id: 'sess-1',
      });

      await rename(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'NewName' }),
        res,
        req,
      );
    });

    it('returns 2004 when user not found', async () => {
      vi.mocked(User.findOneAndUpdate).mockResolvedValue(null);

      const { req, res } = mockReqRes({
        name: 'NewName',
        session_id: 'bad-sess',
      });

      await rename(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, 2004);
    });

    it('returns error on DB failure', async () => {
      vi.mocked(User.findOneAndUpdate).mockRejectedValue(new Error('DB fail'));

      const { req, res } = mockReqRes({
        name: 'NewName',
        session_id: 'sess-1',
      });

      await rename(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, 1, 2, 'Rename failed');
    });
  });

  describe('get', () => {
    it('returns user info for authenticated user', async () => {
      vi.mocked(User.findOne).mockResolvedValue({
        game_id: 'GAME123',
        user_id: 'USER123',
        character_name: 'TestHunter',
        comment: 'Hello',
        model_info: { gender: 0 },
        equipset: {
          capacity_eqp_set: 5,
          equip_sets: [],
          selected_equip_set_index: 1,
        },
        otomoteam: { otomo_team: [], selected_index: 1 },
        box: {
          otomos: [],
          monument: { hr: 1, mlv: { atk: 1, def: 1, hp: 1, sp: 1 } },
        },
        selected_partner: {
          main_partner_id: 'PT_001',
          quest_partner_id: 'PT_001',
        },
      } as never);

      const { req, res } = mockReqRes({ session_id: 'sess-1' });

      await get(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          user_info: expect.objectContaining({
            game_id: 'GAME123',
            name: 'TestHunter',
          }),
        }),
        res,
        req,
      );
    });

    it('returns 2004 when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);

      const { req, res } = mockReqRes({ session_id: 'bad' });

      await get(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, 2004);
    });
  });

  describe('commentSet', () => {
    it('updates comment and returns it', async () => {
      vi.mocked(User.findOneAndUpdate).mockResolvedValue({
        comment: 'New comment',
      } as never);

      const { req, res } = mockReqRes({
        comment: 'New comment',
        session_id: 'sess-1',
      });

      await commentSet(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ comment: 'New comment' }),
        res,
        req,
      );
    });
  });

  describe('navigationNews', () => {
    it('returns empty navigations list', () => {
      const { req, res } = mockReqRes({});

      navigationNews(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ navigations: [] }),
        res,
        req,
      );
    });
  });

  describe('achievementNews', () => {
    it('returns empty achievement lists', () => {
      const { req, res } = mockReqRes({});

      achievementNews(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          achievements: [],
          apple_achievements: [],
          google_achievements: [],
        }),
        res,
        req,
      );
    });
  });

  describe('achievementAll', () => {
    it('returns empty achievements', () => {
      const { req, res } = mockReqRes({});

      achievementAll(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ achievements: [] }),
        res,
        req,
      );
    });
  });

  describe('OfferCheck', () => {
    it('returns offer products', () => {
      const { req, res } = mockReqRes({});

      OfferCheck(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          offer_products: expect.arrayContaining([expect.objectContaining({ name: 'Offer Name' })]),
        }),
        res,
        req,
      );
    });
  });

  describe('titleSet', () => {
    it('sets title and returns user info', async () => {
      vi.mocked(User.findOne).mockResolvedValue({
        game_id: 'GAME123',
        user_id: 'USER123',
        character_name: 'Hunter',
        comment: '',
        model_info: { gender: 0 },
        equipset: { capacity_eqp_set: 5, equip_sets: [] },
        otomoteam: { otomo_team: [], selected_index: 1 },
        box: { otomos: [] },
        selected_partner: {
          main_partner_id: 'PT_001',
          quest_partner_id: 'PT_001',
        },
      } as never);

      const { req, res } = mockReqRes({
        session_id: 'sess-1',
        mst_title_id: 42,
      });

      await titleSet(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          user_info: expect.objectContaining({
            title: { mst_title_id: 42 },
          }),
        }),
        res,
        req,
      );
    });
  });
});
