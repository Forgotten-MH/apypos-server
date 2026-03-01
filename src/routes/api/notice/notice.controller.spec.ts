import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../model/user');
vi.mock('../../../model/presents');
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
import Present from '../../../model/presents.js';
import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { ERROR_CODE } from '../../../constants/error.codes.js';
import { get } from './notice.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('notice.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('get', () => {
    it('returns NOT_AUTHENTICATED when user not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);
      const { req, res } = mockReqRes({ session_id: 'bad' });
      await get(req, res);
      expect(encryptAndSend).toHaveBeenCalledWith({}, res, req, ERROR_CODE.NOT_AUTHENTICATED);
    });

    it('returns notice data with present count', async () => {
      vi.mocked(User.findOne).mockResolvedValue({ uu_id: 'uid1' } as never);
      vi.mocked(Present.countDocuments).mockResolvedValue(3 as never);

      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await get(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          new_present: 3,
          banner_list: expect.objectContaining({
            outer_banner_list: expect.any(Array),
            resident_banner_list: expect.any(Array),
          }),
          campaign_list: expect.objectContaining({
            event_campaign_list: expect.any(Array),
            island_campaign_list: expect.any(Array),
          }),
          navigationNum: expect.objectContaining({
            notClearNum: 5,
          }),
          stretch_effect_info: expect.objectContaining({
            mst_event_info_id: 3454260853,
          }),
        }),
        res,
        req,
      );
    });

    it('returns new_present=0 when no unreceived presents', async () => {
      vi.mocked(User.findOne).mockResolvedValue({ uu_id: 'uid1' } as never);
      vi.mocked(Present.countDocuments).mockResolvedValue(0 as never);

      const { req, res } = mockReqRes({ session_id: 'sess-1' });
      await get(req, res);

      const data = vi.mocked(encryptAndSend).mock.calls[0]![0] as { new_present: number };
      expect(data.new_present).toBe(0);
    });
  });
});
