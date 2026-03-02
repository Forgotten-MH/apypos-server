import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../services/crypto/encryptionHelpers');

import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { premiumList } from './course.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('course.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('premiumList', () => {
    it('returns premium course list with reward data', () => {
      const { req, res } = mockReqRes();
      premiumList(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          premium_course_list: expect.arrayContaining([
            expect.objectContaining({
              mst_course_premium_id: 1,
              price: 20,
              is_enable: 1,
              reward_list: expect.arrayContaining([
                expect.objectContaining({
                  idx: 1,
                  item_list: expect.objectContaining({
                    equipments: expect.any(Array),
                    materials: expect.any(Array),
                    payments: expect.any(Array),
                  }),
                }),
              ]),
            }),
          ]),
        }),
        res,
        req,
      );
    });
  });
});
