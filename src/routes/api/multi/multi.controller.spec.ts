import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../services/crypto/encryptionHelpers');
vi.mock('../../../model/user');
vi.mock('../../../model/room');
vi.mock('../../../config', () => ({
  IP: '127.0.0.1',
}));

import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import User from '../../../model/user.js';
import Room from '../../../model/room.js';
import {
  roomReserve,
  roomReserveJoin,
  roomSearch,
  roomJoin,
  roomQuick,
  roomGet,
  roomCreate,
  inviteList,
  memberInfo,
} from './multi.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, query: {}, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

const mockUser = {
  user_id: 'user1',
  character_name: 'Hunter',
  game_id: 'game1',
};

function createMockRoomDoc(fields: Record<string, unknown> = {}) {
  const room: Record<string, unknown> = {
    room_id: 1,
    host_id: '',
    host_name: '',
    room_name: '',
    quest_id: 0,
    quest_name: '',
    phase: 0,
    is_locked: false,
    is_private: false,
    is_full: false,
    max_members: 4,
    member_count: 0,
    members: [],
    reserve_members: [],
    auto_flag: 0,
    quick_match: 0,
    kick: 0,
    restart: 0,
    tag: 0,
    server_url: '',
    type: 1,
    created_at: new Date(),
    ...fields,
    addMember: vi.fn(),
    removeMember: vi.fn(),
    setMemberReady: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
  };
  room.toRoomInfo = vi.fn(() => ({
    _id: 'mock-id',
    room_id: room.room_id,
    host_id: room.host_id,
    host_name: room.host_name,
    name: room.room_name,
    quest_id: room.quest_id,
    phase: room.phase,
    is_locked: room.is_locked ? 1 : 0,
    member_count: room.member_count,
    members: (room.members as { user_id: string }[]).map((m) => m.user_id),
    auto_flag: room.auto_flag,
    quick_match: room.quick_match,
    kick: room.kick,
    restart: room.restart,
    tag: room.tag,
    reserve_members: room.reserve_members,
    server_url: room.server_url,
    type: room.type,
    created: Math.floor((room.created_at as Date).getTime() / 1000),
  }));
  return room;
}

describe('multi.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
    vi.mocked(User.find).mockResolvedValue([] as never);
  });

  describe('roomReserve', () => {
    it('returns room data with request params', async () => {
      vi.mocked(Room.findOne).mockResolvedValue(null);
      vi.mocked(Room.createRoom).mockImplementation(
        (roomData) => Promise.resolve(createMockRoomDoc({ room_id: 1, ...roomData }) as never),
      );

      const { req, res } = mockReqRes({
        quest_id: 100,
        quick_match: 1,
        reserve_members: ['p1'],
        restart: 0,
      });
      await roomReserve(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          rooms: expect.objectContaining({
            quest_id: 100,
            quick_match: 1,
            reserve_members: ['p1'],
            server_url: 'http://127.0.0.1/',
          }),
        }),
        res,
        req,
      );
    });
  });

  describe('roomReserveJoin', () => {
    it('returns room data', async () => {
      vi.mocked(Room.findOne)
        .mockResolvedValueOnce(null) // existingRoom check
        .mockResolvedValueOnce(createMockRoomDoc({ room_id: 5, quest_id: 200, restart: 1 }) as never);

      const { req, res } = mockReqRes({
        room_id: 5,
      });
      await roomReserveJoin(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          rooms: expect.objectContaining({
            quest_id: 200,
            restart: 1,
          }),
        }),
        res,
        req,
      );
    });
  });

  describe('roomSearch', () => {
    it('returns rooms array', async () => {
      vi.mocked(Room.find).mockReturnValue({
        sort: () => ({
          limit: () => Promise.resolve([createMockRoomDoc({ room_id: 3, quest_id: 300, auto_flag: 1 })]),
        }),
      } as never);

      const { req, res } = mockReqRes({
        quest_id: 300,
        limit: 20,
      });
      await roomSearch(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          rooms: expect.arrayContaining([
            expect.objectContaining({
              auto_flag: 1,
              quest_id: 300,
              room_id: 3,
            }),
          ]),
        }),
        res,
        req,
      );
    });
  });

  describe('roomJoin', () => {
    it('returns room data with room_id from body', async () => {
      vi.mocked(Room.findOne)
        .mockResolvedValueOnce(null) // existingRoom check
        .mockResolvedValueOnce(createMockRoomDoc({ room_id: 42, quest_id: 400, kick: 1 }) as never);

      const { req, res } = mockReqRes({
        quest_id: 400,
        room_id: 42,
      });
      await roomJoin(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          rooms: expect.objectContaining({
            quest_id: 400,
            room_id: 42,
            kick: 1,
          }),
        }),
        res,
        req,
      );
    });

    it('defaults room_id to 1 when not provided', async () => {
      vi.mocked(Room.findOne)
        .mockResolvedValueOnce(null) // existingRoom check
        .mockResolvedValueOnce(createMockRoomDoc({ room_id: 1, quest_id: 400 }) as never);

      const { req, res } = mockReqRes({
        quest_id: 400,
        room_id: 0,
      });
      await roomJoin(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          rooms: expect.objectContaining({
            room_id: 1,
          }),
        }),
        res,
        req,
      );
    });
  });

  describe('roomQuick', () => {
    it('returns room data with name and tag', async () => {
      vi.mocked(Room.findOne)
        .mockResolvedValueOnce(null) // existingRoom check (by user)
        .mockReturnValueOnce({
          sort: () => Promise.resolve(null),
        } as never); // no existing quick-match room
      vi.mocked(Room.createRoom).mockImplementation(
        (roomData) => Promise.resolve(createMockRoomDoc({ room_id: 2, ...roomData }) as never),
      );

      const { req, res } = mockReqRes({
        auto_flag: 1,
        kick: 0,
        name: 'test room',
        quest_id: 500,
        quick_match: 1,
        reserve_members: ['p1'],
        restart: 0,
        tag: 5,
      });
      await roomQuick(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          rooms: expect.objectContaining({
            name: 'test room',
            tag: 5,
            quest_id: 500,
          }),
        }),
        res,
        req,
      );
    });
  });

  describe('roomGet', () => {
    it('returns room with check_join flag', async () => {
      vi.mocked(Room.findOne).mockResolvedValueOnce(
        createMockRoomDoc({ room_id: 99, quest_id: 600 }) as never,
      );

      const { req, res } = mockReqRes({
        quest_id: 600,
        room_id: 99,
      });
      await roomGet(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          check_join: 1,
          rooms: expect.objectContaining({
            quest_id: 600,
            room_id: 99,
          }),
        }),
        res,
        req,
      );
    });
  });

  describe('roomCreate', () => {
    it('returns created room with stripped name', async () => {
      vi.mocked(Room.findOne).mockResolvedValue(null);
      vi.mocked(Room.createRoom).mockImplementation(
        (roomData) => Promise.resolve(createMockRoomDoc({ room_id: 400000000, ...roomData }) as never),
      );

      const { req, res } = mockReqRes({
        auto_flag: 0,
        kick: 0,
        name: 'Hunterの部屋',
        quest_id: 700,
        quick_match: 0,
        reserve_members: [],
        restart: 0,
        tag: 10,
      });
      await roomCreate(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          rooms: expect.objectContaining({
            host_name: 'Hunter',
            name: 'Hunterの部屋',
            room_id: 400000000,
            tag: 10,
          }),
        }),
        res,
        req,
      );
    });
  });

  describe('inviteList', () => {
    it('returns an empty rooms array', async () => {
      const { req, res } = mockReqRes();
      await inviteList(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          rooms: [],
        }),
        res,
        req,
      );
    });
  });

  describe('memberInfo', () => {
    it('returns member info with sequence from body', async () => {
      vi.mocked(Room.findOne).mockResolvedValueOnce(
        createMockRoomDoc({ phase: 6, members: [], reserve_members: [] }) as never,
      );

      const { req, res } = mockReqRes({ sequence: 42 });
      await memberInfo(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          phase: 6,
          sequence: 42,
          player_details: [],
          free: [],
          group: [],
        }),
        res,
        req,
      );
    });
  });
});
