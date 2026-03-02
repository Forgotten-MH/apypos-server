import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../config', () => ({
  IP: '127.0.0.1',
  PORT: 3000,
  WEB_URL: 'http://127.0.0.1:3000/web/',
  RES_URL: 'http://127.0.0.1/',
  API_NOT_AVAILABLE_MAINTENANCE: false,
}));
vi.mock('../../middleware/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

import { getVersionData } from './version.controller.js';

function mockReqRes(versionNumber: string) {
  const req = {
    params: { splat: [versionNumber] },
    ip: '127.0.0.1',
    get: vi.fn(),
  } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    header: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return { req, res };
}

describe('version.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getVersionData', () => {
    it('returns version data for 01.00.00', () => {
      const { req, res } = mockReqRes('01.00.00');
      getVersionData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          res: 'http://127.0.0.1/res',
          api: 'http://127.0.0.1:3000/api',
          web: 'http://127.0.0.1:3000/web/',
          maintenance_env: 'maintenance_env',
        }),
      );
    });

    it('returns version data for 09.03.06', () => {
      const { req, res } = mockReqRes('09.03.06');
      getVersionData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          res: 'http://127.0.0.1/res',
          api: 'http://127.0.0.1:3000/api',
        }),
      );
    });

    it('returns empty object for unknown version', () => {
      const { req, res } = mockReqRes('99.99.99');
      getVersionData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({});
    });
  });
});
