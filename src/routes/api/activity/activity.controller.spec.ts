import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../services/crypto/encryptionHelpers');

import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { activityGet } from './activity.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('activity.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('activityGet', () => {
    it('returns activities array with example data', () => {
      const { req, res } = mockReqRes();
      activityGet(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          activities: expect.arrayContaining([
            expect.objectContaining({
              mst_activity_id: 1,
              mst_activity_type_id: 1,
              user_id: '83SP6Q95',
            }),
          ]),
        }),
        res,
        req,
      );
    });
  });
});
