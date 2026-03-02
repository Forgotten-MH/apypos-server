import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../model/guild');
vi.mock('../model/user');
vi.mock('../utils/generateUniqueId');
vi.mock('../middleware/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }),
}));

import Guild from '../model/guild.js';
import User from '../model/user.js';
import { generateUniqueId } from '../utils/generateUniqueId.js';
import {
  getMemberType,
  generateGuildId,
  generateSearchId,
  createGuild,
  getUserGuildInfo,
  getGuildById,
  getGuildBySearchId,
  searchGuilds,
  getActiveGuilds,
  applyToGuild,
  joinGuild,
  leaveGuild,
  sendChatMessage,
  getChatMessages,
  getMemberList,
} from './guildService.js';

function makeGuildDoc(overrides: Record<string, unknown> = {}) {
  return {
    gid: 'G00001',
    name: 'Test Guild',
    search_id: 'ABCD1234',
    auto_recruit: 0,
    recruit: 1,
    rank: 1,
    exp: 0,
    joined: 1,
    member: {
      leader: { uid: 'leader-1', created: 1000, last_login: 2000 },
      sub: [] as { uid: string; created: number; last_login: number }[],
      normal: [] as { uid: string; created: number; last_login: number }[],
    },
    receive: [] as unknown[],
    send: [] as unknown[],
    chat_messages: [] as unknown[],
    updated: 0,
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeUserDoc(overrides: Record<string, unknown> = {}) {
  return {
    uu_id: 'user-1',
    guild_info: {
      gid: '',
      is_guild: 0,
      member_type: -1,
      name: '',
      rank: 0,
      login_freq: 0,
      chat_freq: 0,
      yarikomi: 0,
      mood: 0,
      timezone: 0,
      waited: 0,
      receive: [],
      send: [],
    },
    ...overrides,
  };
}

describe('guildService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(User.updateOne).mockResolvedValue({} as never);
    vi.mocked(Guild.deleteOne).mockResolvedValue({} as never);
    vi.mocked(generateUniqueId).mockReturnValue('unique-id-1');
  });

  describe('getMemberType', () => {
    it('returns 3 for the leader', () => {
      const guild = makeGuildDoc();
      expect(getMemberType(guild, 'leader-1')).toBe(3);
    });

    it('returns 2 for a sub-leader', () => {
      const guild = makeGuildDoc({
        member: {
          leader: { uid: 'leader-1', created: 0, last_login: 0 },
          sub: [{ uid: 'sub-1', created: 0, last_login: 0 }],
          normal: [],
        },
      });
      expect(getMemberType(guild, 'sub-1')).toBe(2);
    });

    it('returns 1 for a normal member', () => {
      const guild = makeGuildDoc({
        member: {
          leader: { uid: 'leader-1', created: 0, last_login: 0 },
          sub: [],
          normal: [{ uid: 'normal-1', created: 0, last_login: 0 }],
        },
      });
      expect(getMemberType(guild, 'normal-1')).toBe(1);
    });

    it('returns 0 for a non-member', () => {
      const guild = makeGuildDoc();
      expect(getMemberType(guild, 'stranger')).toBe(0);
    });
  });

  describe('generateGuildId', () => {
    it('returns a 6-digit string', async () => {
      vi.mocked(Guild.findOne).mockResolvedValue(null);
      const id = await generateGuildId();
      expect(id).toMatch(/^\d{6}$/);
    });

    it('retries on collision', async () => {
      vi.mocked(Guild.findOne)
        .mockResolvedValueOnce({ gid: '111111' } as never)
        .mockResolvedValueOnce(null);
      const id = await generateGuildId();
      expect(id).toMatch(/^\d{6}$/);
      expect(Guild.findOne).toHaveBeenCalledTimes(2);
    });
  });

  describe('generateSearchId', () => {
    it('returns an 8-char alphanumeric string', async () => {
      vi.mocked(Guild.findOne).mockResolvedValue(null);
      const id = await generateSearchId();
      expect(id).toMatch(/^[A-Z0-9]{8}$/);
    });

    it('retries on collision', async () => {
      vi.mocked(Guild.findOne)
        .mockResolvedValueOnce({ search_id: 'XXXXXXXX' } as never)
        .mockResolvedValueOnce(null);
      const id = await generateSearchId();
      expect(id).toMatch(/^[A-Z0-9]{8}$/);
      expect(Guild.findOne).toHaveBeenCalledTimes(2);
    });
  });

  describe('createGuild', () => {
    it('creates a guild with the user as leader and updates user', async () => {
      vi.mocked(Guild.findOne).mockResolvedValue(null);
      const saveMock = vi.fn().mockResolvedValue(undefined);
      vi.mocked(Guild.prototype.save).mockImplementation(saveMock);

      const result = await createGuild('uid-1', 'My Guild', { mood: 1 });
      expect(result).toBeDefined();
      expect(saveMock).toHaveBeenCalled();
      expect(User.updateOne).toHaveBeenCalledWith(
        { uu_id: 'uid-1' },
        expect.objectContaining({
          $set: expect.objectContaining({
            'guild_info.gid': expect.any(String),
            'guild_info.is_guild': 1,
          }),
        }),
      );
    });
  });

  describe('getUserGuildInfo', () => {
    it('returns null when user is not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const result = await getUserGuildInfo('unknown');
      expect(result).toBeNull();
    });

    it('returns mapped guild_info fields', async () => {
      const user = makeUserDoc({
        uu_id: 'u1',
        guild_info: {
          gid: 'G001',
          is_guild: 1,
          login_freq: 2,
          chat_freq: 3,
          yarikomi: 1,
          mood: 2,
          timezone: 9,
          waited: 0,
          receive: [],
          send: [],
        },
      });
      vi.mocked(User.findOne).mockResolvedValue(user as never);
      const result = await getUserGuildInfo('u1');
      expect(result).toEqual(
        expect.objectContaining({
          uid: 'u1',
          gid: 'G001',
          joined: 1,
          login_freq: 2,
          chat_freq: 3,
        }),
      );
    });
  });

  describe('getGuildById', () => {
    it('delegates to Guild.findOne with gid', async () => {
      const guild = makeGuildDoc();
      vi.mocked(Guild.findOne).mockResolvedValue(guild as never);
      const result = await getGuildById('G00001');
      expect(Guild.findOne).toHaveBeenCalledWith({ gid: 'G00001' });
      expect(result).toBe(guild);
    });

    it('returns null when not found', async () => {
      vi.mocked(Guild.findOne).mockResolvedValue(null);
      const result = await getGuildById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getGuildBySearchId', () => {
    it('delegates to Guild.findOne with search_id', async () => {
      const guild = makeGuildDoc();
      vi.mocked(Guild.findOne).mockResolvedValue(guild as never);
      const result = await getGuildBySearchId('ABCD1234');
      expect(Guild.findOne).toHaveBeenCalledWith({ search_id: 'ABCD1234' });
      expect(result).toBe(guild);
    });
  });

  describe('searchGuilds', () => {
    it('builds query from filters and calls find().limit(50)', async () => {
      const mockLimit = vi.fn().mockResolvedValue([]);
      vi.mocked(Guild.find).mockReturnValue({ limit: mockLimit } as never);

      await searchGuilds({ name: 'Test', mood: 1 });
      expect(Guild.find).toHaveBeenCalledWith({
        name: { $regex: 'Test', $options: 'i' },
        mood: 1,
      });
      expect(mockLimit).toHaveBeenCalledWith(50);
    });

    it('passes empty query when no filters provided', async () => {
      const mockLimit = vi.fn().mockResolvedValue([]);
      vi.mocked(Guild.find).mockReturnValue({ limit: mockLimit } as never);

      await searchGuilds({});
      expect(Guild.find).toHaveBeenCalledWith({});
    });
  });

  describe('getActiveGuilds', () => {
    it('queries with recruit and joined filters, sorts and limits', async () => {
      const mockLimit = vi.fn().mockResolvedValue([]);
      const mockSort = vi.fn().mockReturnValue({ limit: mockLimit });
      vi.mocked(Guild.find).mockReturnValue({ sort: mockSort } as never);

      await getActiveGuilds(10);
      expect(Guild.find).toHaveBeenCalledWith({
        recruit: { $gte: 1 },
        joined: { $lt: 30 },
      });
      expect(mockSort).toHaveBeenCalledWith({ rank: -1, joined: -1, updated: -1 });
      expect(mockLimit).toHaveBeenCalledWith(10);
    });
  });

  describe('applyToGuild', () => {
    it('throws when guild not found', async () => {
      vi.mocked(Guild.findOne).mockResolvedValue(null);
      await expect(applyToGuild('u1', 'bad-gid')).rejects.toThrow('Guild not found');
    });

    it('throws when user not found', async () => {
      vi.mocked(Guild.findOne).mockResolvedValue(makeGuildDoc() as never);
      vi.mocked(User.findOne).mockResolvedValue(null);
      await expect(applyToGuild('u1', 'G00001')).rejects.toThrow('User not found');
    });

    it('throws when user already in a guild', async () => {
      vi.mocked(Guild.findOne).mockResolvedValue(makeGuildDoc() as never);
      vi.mocked(User.findOne).mockResolvedValue(
        makeUserDoc({ guild_info: { gid: 'OTHER', is_guild: 1 } }) as never,
      );
      await expect(applyToGuild('u1', 'G00001')).rejects.toThrow(
        'You are already in another guild',
      );
    });

    it('auto-joins when auto_recruit > 0 and guild is not full', async () => {
      const guild = makeGuildDoc({ auto_recruit: 1, joined: 5 });
      vi.mocked(Guild.findOne).mockResolvedValue(guild as never);
      vi.mocked(User.findOne).mockResolvedValue(makeUserDoc() as never);

      const result = await applyToGuild('user-1', 'G00001');
      expect(result.autoJoined).toBe(true);
      expect(result.requestId).toBeNull();
      expect(guild.member.normal).toHaveLength(1);
      expect(guild.joined).toBe(6);
      expect(guild.save).toHaveBeenCalled();
      expect(User.updateOne).toHaveBeenCalled();
    });

    it('creates application request when not auto-recruit', async () => {
      const guild = makeGuildDoc({ auto_recruit: 0 });
      vi.mocked(Guild.findOne).mockResolvedValue(guild as never);
      vi.mocked(User.findOne).mockResolvedValue(makeUserDoc() as never);

      const result = await applyToGuild('user-1', 'G00001');
      expect(result.autoJoined).toBe(false);
      expect(result.requestId).toBe('unique-id-1');
      expect(guild.receive).toHaveLength(1);
      expect(guild.save).toHaveBeenCalled();
    });
  });

  describe('joinGuild', () => {
    it('throws when guild not found', async () => {
      vi.mocked(Guild.findOne).mockResolvedValue(null);
      await expect(joinGuild('u1', 'bad-gid')).rejects.toThrow('Guild not found');
    });

    it('throws when user not found', async () => {
      vi.mocked(Guild.findOne).mockResolvedValue(makeGuildDoc() as never);
      vi.mocked(User.findOne).mockResolvedValue(null);
      await expect(joinGuild('u1', 'G00001')).rejects.toThrow('User not found');
    });

    it('throws when user already in a guild', async () => {
      vi.mocked(Guild.findOne).mockResolvedValue(makeGuildDoc() as never);
      vi.mocked(User.findOne).mockResolvedValue(
        makeUserDoc({ guild_info: { gid: 'OTHER', is_guild: 1 } }) as never,
      );
      await expect(joinGuild('u1', 'G00001')).rejects.toThrow(
        'You are already in another guild',
      );
    });

    it('adds user as normal member and increments joined', async () => {
      const guild = makeGuildDoc({ joined: 3 });
      vi.mocked(Guild.findOne).mockResolvedValue(guild as never);
      vi.mocked(User.findOne).mockResolvedValue(makeUserDoc() as never);

      const result = await joinGuild('user-1', 'G00001');
      expect(result.success).toBe(true);
      expect(guild.member.normal).toHaveLength(1);
      expect(guild.joined).toBe(4);
      expect(guild.save).toHaveBeenCalled();
      expect(User.updateOne).toHaveBeenCalledWith(
        { uu_id: 'user-1' },
        expect.objectContaining({
          $set: expect.objectContaining({
            'guild_info.gid': 'G00001',
            'guild_info.is_guild': 1,
            'guild_info.member_type': 1,
          }),
        }),
      );
    });
  });

  describe('leaveGuild', () => {
    it('throws when user is not in any guild', async () => {
      vi.mocked(User.findOne).mockResolvedValue(makeUserDoc() as never);
      await expect(leaveGuild('user-1')).rejects.toThrow('You are not in any guild');
    });

    it('throws when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      await expect(leaveGuild('u1')).rejects.toThrow('You are not in any guild');
    });

    it('promotes sub-leader when leader leaves and subs exist', async () => {
      const guild = makeGuildDoc({
        joined: 3,
        member: {
          leader: { uid: 'leader-1', created: 100, last_login: 200 },
          sub: [{ uid: 'sub-1', created: 300, last_login: 400 }],
          normal: [{ uid: 'normal-1', created: 500, last_login: 600 }],
        },
      });
      const user = makeUserDoc({
        uu_id: 'leader-1',
        guild_info: { gid: 'G00001', is_guild: 1 },
      });
      vi.mocked(User.findOne).mockResolvedValue(user as never);
      vi.mocked(Guild.findOne).mockResolvedValue(guild as never);

      const result = await leaveGuild('leader-1');
      expect(result.disbanded).toBe(false);
      expect(guild.member.leader.uid).toBe('sub-1');
      expect(guild.member.sub).toHaveLength(0);
      expect(guild.save).toHaveBeenCalled();
    });

    it('promotes normal member when leader leaves with no subs', async () => {
      const guild = makeGuildDoc({
        joined: 2,
        member: {
          leader: { uid: 'leader-1', created: 100, last_login: 200 },
          sub: [],
          normal: [{ uid: 'normal-1', created: 300, last_login: 400 }],
        },
      });
      const user = makeUserDoc({
        uu_id: 'leader-1',
        guild_info: { gid: 'G00001', is_guild: 1 },
      });
      vi.mocked(User.findOne).mockResolvedValue(user as never);
      vi.mocked(Guild.findOne).mockResolvedValue(guild as never);

      const result = await leaveGuild('leader-1');
      expect(result.disbanded).toBe(false);
      expect(guild.member.leader.uid).toBe('normal-1');
      expect(guild.member.normal).toHaveLength(0);
    });

    it('disbands guild when leader is last member', async () => {
      const guild = makeGuildDoc({
        joined: 1,
        member: {
          leader: { uid: 'leader-1', created: 100, last_login: 200 },
          sub: [],
          normal: [],
        },
      });
      const user = makeUserDoc({
        uu_id: 'leader-1',
        guild_info: { gid: 'G00001', is_guild: 1 },
      });
      vi.mocked(User.findOne).mockResolvedValue(user as never);
      vi.mocked(Guild.findOne).mockResolvedValue(guild as never);

      const result = await leaveGuild('leader-1');
      expect(result.disbanded).toBe(true);
      expect(Guild.deleteOne).toHaveBeenCalledWith({ gid: 'G00001' });
    });

    it('removes normal member without affecting leadership', async () => {
      const normalMembers = [
        { uid: 'normal-1', created: 300, last_login: 400 },
        { uid: 'normal-2', created: 500, last_login: 600 },
      ];
      // Simulate Mongoose subdocument array with pull method
      Object.assign(normalMembers, {
        pull: function (member: { uid: string }) {
          const idx = normalMembers.findIndex((m) => m.uid === member.uid);
          if (idx !== -1) normalMembers.splice(idx, 1);
        },
      });

      const guild = makeGuildDoc({
        joined: 3,
        member: {
          leader: { uid: 'leader-1', created: 100, last_login: 200 },
          sub: Object.assign([], {
            pull: vi.fn(),
            find: (fn: (m: { uid: string }) => boolean) =>
              [].find(fn),
          }),
          normal: normalMembers,
        },
      });
      const user = makeUserDoc({
        uu_id: 'normal-1',
        guild_info: { gid: 'G00001', is_guild: 1 },
      });
      vi.mocked(User.findOne).mockResolvedValue(user as never);
      vi.mocked(Guild.findOne).mockResolvedValue(guild as never);

      const result = await leaveGuild('normal-1');
      expect(result.disbanded).toBe(false);
      expect(guild.joined).toBe(2);
      expect(guild.save).toHaveBeenCalled();
    });
  });

  describe('sendChatMessage', () => {
    it('throws when user is not in the guild', async () => {
      vi.mocked(User.findOne).mockResolvedValue(
        makeUserDoc({ guild_info: { gid: '', is_guild: 0 } }) as never,
      );
      await expect(sendChatMessage('u1', 'G001', 'hello', 'Player')).rejects.toThrow();
    });

    it('throws when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      await expect(sendChatMessage('u1', 'G001', 'hello', 'Player')).rejects.toThrow();
    });

    it('appends message and saves guild', async () => {
      vi.mocked(User.findOne).mockResolvedValue(
        makeUserDoc({
          uu_id: 'u1',
          guild_info: { gid: 'G00001', is_guild: 1 },
        }) as never,
      );
      const guild = makeGuildDoc({ chat_messages: [] });
      vi.mocked(Guild.findOne).mockResolvedValue(guild as never);

      const result = await sendChatMessage('u1', 'G00001', 'hello', 'Hunter');
      expect(result.message).toBe('hello');
      expect(result.character_name).toBe('Hunter');
      expect(result.uid).toBe('u1');
      expect(guild.chat_messages).toHaveLength(1);
      expect(guild.save).toHaveBeenCalled();
    });

    it('caps messages at 100', async () => {
      vi.mocked(User.findOne).mockResolvedValue(
        makeUserDoc({
          uu_id: 'u1',
          guild_info: { gid: 'G00001', is_guild: 1 },
        }) as never,
      );
      const messages = Array.from({ length: 100 }, (_, i) => ({
        uid: 'u1',
        character_name: 'H',
        message: `msg-${i}`,
        timestamp: i,
      }));
      const guild = makeGuildDoc({ chat_messages: messages });
      vi.mocked(Guild.findOne).mockResolvedValue(guild as never);

      await sendChatMessage('u1', 'G00001', 'new msg', 'Hunter');
      expect(guild.chat_messages.length).toBe(100);
    });
  });

  describe('getChatMessages', () => {
    it('throws when user is not in any guild', async () => {
      vi.mocked(User.findOne).mockResolvedValue(
        makeUserDoc({ guild_info: { gid: '', is_guild: 0 } }) as never,
      );
      await expect(getChatMessages('u1')).rejects.toThrow('You are not in any guild');
    });

    it('returns reversed messages', async () => {
      vi.mocked(User.findOne).mockResolvedValue(
        makeUserDoc({
          guild_info: { gid: 'G00001', is_guild: 1 },
        }) as never,
      );
      const msgs = [
        { uid: 'u1', character_name: 'A', message: 'first', timestamp: 1 },
        { uid: 'u1', character_name: 'A', message: 'second', timestamp: 2 },
      ];
      vi.mocked(Guild.findOne).mockResolvedValue(
        makeGuildDoc({ chat_messages: msgs }) as never,
      );

      const result = await getChatMessages('u1');
      expect(result[0]!.message).toBe('second');
      expect(result[1]!.message).toBe('first');
    });
  });

  describe('getMemberList', () => {
    it('returns empty structure when guild not found', async () => {
      vi.mocked(Guild.findOne).mockResolvedValue(null);
      const result = await getMemberList('nonexistent');
      expect(result).toEqual({ leader: null, normal: [], sub: [] });
    });

    it('returns guild member structure', async () => {
      const guild = makeGuildDoc({
        member: {
          leader: { uid: 'l1', created: 0, last_login: 0 },
          sub: [{ uid: 's1', created: 0, last_login: 0 }],
          normal: [{ uid: 'n1', created: 0, last_login: 0 }],
        },
      });
      vi.mocked(Guild.findOne).mockResolvedValue(guild as never);
      const result = await getMemberList('G00001');
      expect(result.leader.uid).toBe('l1');
      expect(result.sub).toHaveLength(1);
      expect(result.normal).toHaveLength(1);
    });
  });
});
