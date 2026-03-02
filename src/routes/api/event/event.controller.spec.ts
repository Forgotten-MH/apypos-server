import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../services/crypto/encryptionHelpers');

import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { infoGet, limitedskillGet } from './event.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('event.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('infoGet', () => {
    it('returns event info with beginner node and total event points', () => {
      const { req, res } = mockReqRes({});
      infoGet(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          beginner_node_id: [1122664016],
          event_info: expect.any(Array),
          total_event_point_info: expect.arrayContaining([
            expect.objectContaining({
              amount: 20,
              mst_event_point_id: 898968147,
            }),
          ]),
        }),
        res,
        req,
      );
    });
  });

  describe('limitedskillGet', () => {
    it('returns empty limited skill lists', () => {
      const { req, res } = mockReqRes({});
      limitedskillGet(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          limited_skill_excl_ev_infos: [],
          limited_skill_infos: [],
        }),
        res,
        req,
      );
    });
  });
});
