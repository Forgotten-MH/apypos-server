import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../services/crypto/encryptionHelpers');
vi.mock('../../../config', () => ({
  IP: '127.0.0.1',
}));

import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
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
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('multi.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('roomReserve', () => {
    it('returns room data with request params', () => {
      const { req, res } = mockReqRes({
        quest_id: 100,
        quick_match: 1,
        reserve: ['p1'],
        restart: 0,
      });
      roomReserve(req, res);

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
    it('returns room data', () => {
      const { req, res } = mockReqRes({
        quest_id: 200,
        quick_match: 0,
        reserve: [],
        restart: 1,
      });
      roomReserveJoin(req, res);

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
    it('returns rooms array', () => {
      const { req, res } = mockReqRes({
        auto_flag: 1,
        kick: 0,
        quest_id: 300,
        quick_match: 1,
        restart: 0,
      });
      roomSearch(req, res);

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
    it('returns room data with room_id from body', () => {
      const { req, res } = mockReqRes({
        auto_flag: 0,
        kick: 1,
        quest_id: 400,
        quick_match: 0,
        reserve: [],
        restart: 0,
        room_id: 42,
      });
      roomJoin(req, res);

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

    it('defaults room_id to 1 when not provided', () => {
      const { req, res } = mockReqRes({
        auto_flag: 0,
        kick: 0,
        quest_id: 400,
        quick_match: 0,
        reserve: [],
        restart: 0,
        room_id: 0,
      });
      roomJoin(req, res);

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
    it('returns room data with name and tag', () => {
      const { req, res } = mockReqRes({
        auto_flag: 1,
        kick: 0,
        name: 'test room',
        quest_id: 500,
        quick_match: 1,
        reserve: ['p1'],
        restart: 0,
        tag: 5,
      });
      roomQuick(req, res);

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
    it('returns room with check_join flag', () => {
      const { req, res } = mockReqRes({
        quest_id: 600,
        room_id: 99,
      });
      roomGet(req, res);

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
    it('returns created room with stripped name', () => {
      const { req, res } = mockReqRes({
        auto_flag: 0,
        kick: 0,
        name: 'Hunterの部屋',
        quest_id: 700,
        quick_match: 0,
        reserve: [],
        restart: 0,
        tag: 10,
      });
      roomCreate(req, res);

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
    it('returns rooms array with invite data', () => {
      const { req, res } = mockReqRes();
      inviteList(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          rooms: expect.arrayContaining([
            expect.objectContaining({
              host_name: 'host_name',
              quest_id: 3176462836,
              room_id: 12345,
            }),
          ]),
        }),
        res,
        req,
      );
    });
  });

  describe('memberInfo', () => {
    it('returns member info with sequence from body', () => {
      const { req, res } = mockReqRes({ sequence: 42 });
      memberInfo(req, res);

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
