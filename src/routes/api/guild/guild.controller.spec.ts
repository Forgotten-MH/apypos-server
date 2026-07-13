import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../model/user');
vi.mock('../../../services/guildService');
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
import * as guildService from '../../../services/guildService.js';
import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { ERROR_CODE, ERROR_CATEGORY } from '../../../constants/error.codes.js';
import {
  userGet,
  userSetup,
  searchResult,
  create,
  getUserGuild,
  bingoGet,
  searchId,
  apply,
  search,
  chatSend,
  chatGet,
  mailList,
  memberList,
} from './guild.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

const mockUser = { uu_id: 'uid1', character_name: 'Hunter', model_info: { face: 1, gender: 0, hair: 2, hair_color: 3, inner: 0, skin: 1 } };

const mockGuild = {
  gid: 'g123',
  auto_recruit: 1,
  bingo: [],
  bonus_value: 0,
  chat_freq: 0,
  comment: '',
  created: 1000,
  exp: 0,
  explusion_rule: 0,
  free_comment: 'Welcome',
  holding_bingo_id: 0,
  mark_box: [],
  member: [],
  joined: 1,
  login_freq: 0,
  mood: 0,
  name: 'TestGuild',
  rank: 1,
  receive: [],
  recruit: 1,
  search_id: 'ABC12345',
  send: [],
  set_mark: 0,
  timezone: 0,
  updated: 2000,
  yarikomi: 0,
};

const mockUserGuild = {
  gid: 'g123',
  uid: 'uid1',
  chat_freq: 0,
  created: 1000,
  joined: 1,
  login_freq: 0,
  mood: 0,
  receive: [],
  send: [],
  timezone: 0,
  updated: 2000,
  waited: 0,
  yarikomi: 0,
};

describe('guild.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('userGet', () => {
    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'bad' });
      await userGet(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('returns empty user_guild when no guild info', async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      vi.mocked(guildService.getUserGuildInfo).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await userGet(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ user_guild: expect.objectContaining({ uid: 'uid1', gid: '' }) }),
        res,
        req,
      );
    });

    it('returns user guild data when found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      vi.mocked(guildService.getUserGuildInfo).mockResolvedValue(mockUserGuild);
      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await userGet(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ user_guild: expect.objectContaining({ gid: 'g123', uid: 'uid1' }) }),
        res,
        req,
      );
    });

    it('returns error on DB failure', async () => {
      vi.mocked(User.findOne).mockRejectedValue(new Error('DB fail'));
      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await userGet(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        { user_guild: null },
        res,
        req,
        ERROR_CODE.GENERIC_ERROR,
        ERROR_CATEGORY.ERROR_DIALOG,
        'Get user guild information failed',
      );
    });
  });

  describe('userSetup', () => {
    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'bad' });
      await userSetup(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('returns empty user_guild on success', async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await userSetup(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ user_guild: expect.objectContaining({ uid: 'uid1', gid: '' }) }),
        res,
        req,
      );
    });
  });

  describe('searchResult', () => {
    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'bad' });
      await searchResult(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('returns user guild data on success', async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      vi.mocked(guildService.getUserGuildInfo).mockResolvedValue(mockUserGuild);
      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await searchResult(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ user_guild: expect.objectContaining({ gid: 'g123' }) }),
        res,
        req,
      );
    });
  });

  describe('create', () => {
    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'bad', name: 'Guild' });
      await create(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('rejects empty guild name', async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      const { req, res } = mockReqRes({ session_id: 'sess-1', name: '' });
      await create(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        { guild: null },
        res,
        req,
        ERROR_CODE.GENERIC_ERROR,
        ERROR_CATEGORY.ERROR_DIALOG,
        'Guild name cannot be empty',
      );
    });

    it('rejects if user already in a guild', async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      vi.mocked(guildService.getUserGuildInfo).mockResolvedValue({ gid: 'g1', joined: 1 } as never);
      const { req, res } = mockReqRes({ session_id: 'sess-1', name: 'New' });
      await create(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        { guild: null },
        res,
        req,
        ERROR_CODE.GENERIC_ERROR,
        ERROR_CATEGORY.ERROR_DIALOG,
        'You are already in a guild',
      );
    });

    it('creates guild and returns data on success', async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      vi.mocked(guildService.getUserGuildInfo).mockResolvedValue(null);
      vi.mocked(guildService.createGuild).mockResolvedValue(mockGuild as never);
      const { req, res } = mockReqRes({ session_id: 'sess-1', name: 'TestGuild' });
      await create(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ guild: expect.objectContaining({ name: 'TestGuild', gid: 'g123' }) }),
        res,
        req,
      );
    });
  });

  describe('getUserGuild', () => {
    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'bad' });
      await getUserGuild(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('returns error when user not in guild', async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      vi.mocked(guildService.getUserGuildInfo).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await getUserGuild(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        { guild: null },
        res,
        req,
        ERROR_CODE.GENERIC_ERROR,
        ERROR_CATEGORY.ERROR_DIALOG,
        'You are not in a guild',
      );
    });

    it('returns guild data on success', async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      vi.mocked(guildService.getUserGuildInfo).mockResolvedValue(mockUserGuild);
      vi.mocked(guildService.getGuildById).mockResolvedValue(mockGuild as never);
      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await getUserGuild(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ guild: expect.objectContaining({ name: 'TestGuild' }) }),
        res,
        req,
      );
    });
  });

  describe('bingoGet', () => {
    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'bad' });
      await bingoGet(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('returns bingo data with is_guild=1 when in guild', async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      vi.mocked(guildService.getUserGuildInfo).mockResolvedValue(mockUserGuild);
      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await bingoGet(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          holdInfo: expect.objectContaining({ is_guild: 1 }),
          bingoDetail: expect.objectContaining({ aligned_line: 0 }),
        }),
        res,
        req,
      );
    });

    it('returns bingo data with is_guild=0 when not in guild', async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      vi.mocked(guildService.getUserGuildInfo).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await bingoGet(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          holdInfo: expect.objectContaining({ is_guild: 0 }),
        }),
        res,
        req,
      );
    });
  });

  describe('searchId', () => {
    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'bad', id: 'ABC' });
      await searchId(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('returns NOT_FOUND when guild not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      vi.mocked(guildService.getGuildBySearchId).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'sess-1', id: 'NOTFOUND' });
      await searchId(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ guilds: [], total: 0 }),
        res,
        req,
        ERROR_CODE.NOT_FOUND,
        ERROR_CATEGORY.ERROR_DIALOG,
        'Guild not found',
      );
    });

    it('returns guild data when found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      vi.mocked(guildService.getGuildBySearchId).mockResolvedValue(mockGuild as never);
      const { req, res } = mockReqRes({ session_id: 'sess-1', id: 'ABC12345' });
      await searchId(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ guild: expect.objectContaining({ name: 'TestGuild' }) }),
        res,
        req,
      );
    });
  });

  describe('apply', () => {
    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'bad', gid: 'g1' });
      await apply(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('rejects missing guild ID', async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await apply(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        {},
        res,
        req,
        ERROR_CODE.GENERIC_ERROR,
        ERROR_CATEGORY.ERROR_DIALOG,
        'Missing guild ID',
      );
    });

    it('returns guild and user_guild data on success', async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      vi.mocked(guildService.applyToGuild).mockResolvedValue({ success: true } as never);
      vi.mocked(guildService.getGuildById).mockResolvedValue(mockGuild as never);
      vi.mocked(guildService.getUserGuildInfo).mockResolvedValue(mockUserGuild);
      const { req, res } = mockReqRes({ session_id: 'sess-1', gid: 'g123' });
      await apply(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          guild: expect.objectContaining({ _id: 'g123', name: 'TestGuild' }),
          user_guild: expect.objectContaining({ uid: 'uid1', gid: 'g123' }),
        }),
        res,
        req,
      );
    });
  });

  describe('search', () => {
    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'bad' });
      await search(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('returns guild list on success', async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      vi.mocked(guildService.searchGuilds).mockResolvedValue([mockGuild] as never);
      const { req, res } = mockReqRes({ session_id: 'sess-1', name: 'Test' });
      await search(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          guild: expect.arrayContaining([expect.objectContaining({ name: 'TestGuild' })]),
        }),
        res,
        req,
      );
    });
  });

  describe('chatSend', () => {
    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'bad', gid: 'g1', message: 'hi' });
      await chatSend(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('rejects missing guild ID', async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      const { req, res } = mockReqRes({ session_id: 'sess-1', message: 'hi' });
      await chatSend(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        {},
        res,
        req,
        ERROR_CODE.GENERIC_ERROR,
        ERROR_CATEGORY.ERROR_DIALOG,
        'Missing guild ID',
      );
    });

    it('rejects empty message', async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      const { req, res } = mockReqRes({ session_id: 'sess-1', gid: 'g1', message: '' });
      await chatSend(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        {},
        res,
        req,
        ERROR_CODE.GENERIC_ERROR,
        ERROR_CATEGORY.ERROR_DIALOG,
        'Message cannot be empty',
      );
    });

    it('sends chat and returns data on success', async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      vi.mocked(guildService.sendChatMessage).mockResolvedValue({
        message: 'hello',
        uid: 'uid1',
        character_name: 'Hunter',
        timestamp: 12345,
      });
      const { req, res } = mockReqRes({ session_id: 'sess-1', gid: 'g1', message: 'hello' });
      await chatSend(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'hello', user_id: 'uid1', success: 1 }),
        res,
        req,
      );
    });
  });

  describe('chatGet', () => {
    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'bad' });
      await chatGet(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('returns empty chat when not in guild', async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      vi.mocked(guildService.getUserGuildInfo).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await chatGet(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          chatLog: expect.objectContaining({ chat_logs: [], gid: '' }),
          chatUserInfos: [],
        }),
        res,
        req,
      );
    });

    it('returns chat logs when in guild', async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      vi.mocked(guildService.getUserGuildInfo).mockResolvedValue(mockUserGuild);
      vi.mocked(guildService.getChatMessages).mockResolvedValue([
        { message: 'hi', timestamp: 1000, uid: 'uid1' },
      ] as never);
      vi.mocked(User.find).mockResolvedValue([mockUser] as never);
      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await chatGet(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          chatLog: expect.objectContaining({
            gid: 'g123',
            chat_logs: expect.arrayContaining([
              expect.objectContaining({ comment: 'hi', uid: 'uid1' }),
            ]),
          }),
          chatUserInfos: expect.arrayContaining([
            expect.objectContaining({ name: 'Hunter', uid: 'uid1' }),
          ]),
        }),
        res,
        req,
      );
    });
  });

  describe('mailList', () => {
    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'bad' });
      await mailList(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('returns error when not in guild', async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      vi.mocked(guildService.getUserGuildInfo).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await mailList(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        { mails: [] },
        res,
        req,
        ERROR_CODE.GENERIC_ERROR,
        ERROR_CATEGORY.ERROR_DIALOG,
        'You are not in a guild',
      );
    });

    it('returns empty mails when in guild', async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
      vi.mocked(guildService.getUserGuildInfo).mockResolvedValue(mockUserGuild);
      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await mailList(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ mails: [] }),
        res,
        req,
      );
    });
  });

  describe('memberList', () => {
    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'bad' });
      await memberList(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('returns member details for guild with leader', async () => {
      const memberUser = {
        ...mockUser,
        toObject: () => ({ comment: 'Hello', created: 1000 }),
      };
      vi.mocked(User.findOne)
        .mockResolvedValueOnce(mockUser as never) // getUserFromSession
        .mockResolvedValueOnce(memberUser as never); // buildMemberDetails for leader
      vi.mocked(guildService.getUserGuildInfo).mockResolvedValue(mockUserGuild);
      vi.mocked(guildService.getGuildById).mockResolvedValue(mockGuild as never);
      vi.mocked(guildService.getMemberList).mockResolvedValue({
        leader: { uid: 'uid1' },
        sub: [],
        normal: [],
      } as never);
      const { req, res } = mockReqRes({ session_id: 'sess-1', gid: 'g123' });
      await memberList(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: 'g123',
          leader_details: expect.objectContaining({ name: 'Hunter' }),
          normal_details: [],
          sub_details: [],
        }),
        res,
        req,
      );
    });

    it('returns error on DB failure', async () => {
      vi.mocked(User.findOne).mockRejectedValue(new Error('DB fail'));
      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await memberList(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({ leader_details: {}, normal_details: [], sub_details: [] }),
        res,
        req,
        1,
        2,
        'DB fail',
      );
    });
  });
});
