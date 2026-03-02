import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../services/crypto/encryptionHelpers');
vi.mock('../../../config', () => ({
  IS_MAINTENANCE: 0,
}));

import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import {
  checkMaintenance,
  getTitleImage,
} from './maintenance.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('maintenance.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('checkMaintenance', () => {
    it('returns maintenance status and title banner', () => {
      const { req, res } = mockReqRes();
      checkMaintenance(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          is_maintenance: 0,
          title_banner: expect.objectContaining({
            banner_id: 'btop_0204403',
            type: 1,
          }),
          web_url: 'maintenance',
        }),
        res,
        req,
      );
    });
  });

  describe('getTitleImage', () => {
    it('returns title banner and image data', () => {
      const { req, res } = mockReqRes();
      getTitleImage(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          title_banner: expect.objectContaining({
            banner_id: 'btop_0204403',
          }),
          title_image: expect.objectContaining({
            mst_title_image_id: 0,
            mst_title_logo_id: 0,
          }),
        }),
        res,
        req,
      );
    });
  });
});
