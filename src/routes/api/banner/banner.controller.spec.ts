import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../services/crypto/encryptionHelpers');
vi.mock('../../../middleware/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));
vi.mock('fs', () => ({
  promises: {
    readdir: vi.fn(),
    stat: vi.fn(),
  },
}));
vi.mock('crc/crcjam', () => ({ default: () => 12345 }));

import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import { promises as fs } from 'fs';
import { getDlList } from './banner.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return { req, res };
}

describe('banner.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getDlList', () => {
    it('returns download list for android (device_id 2)', async () => {
      vi.mocked(fs.readdir).mockResolvedValue(['test.fpk'] as unknown as Awaited<ReturnType<typeof fs.readdir>>);
      vi.mocked(fs.stat).mockResolvedValue({ size: 1024 } as Awaited<ReturnType<typeof fs.stat>>);

      const { req, res } = mockReqRes({ device_id: 2 });
      await getDlList(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          download_list: expect.arrayContaining([
            expect.objectContaining({
              hash: 12345,
              path: '/test.fpk',
              size: 1024,
            }),
          ]),
        }),
        res,
        req,
      );
    });

    it('returns download list for ios (device_id 3)', async () => {
      vi.mocked(fs.readdir).mockResolvedValue(['banner.fpk'] as unknown as Awaited<ReturnType<typeof fs.readdir>>);
      vi.mocked(fs.stat).mockResolvedValue({ size: 2048 } as Awaited<ReturnType<typeof fs.stat>>);

      const { req, res } = mockReqRes({ device_id: 3 });
      await getDlList(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          download_list: expect.arrayContaining([
            expect.objectContaining({ size: 2048 }),
          ]),
        }),
        res,
        req,
      );
    });

    it('returns 400 for invalid device_id', async () => {
      const { req, res } = mockReqRes({ device_id: 99 });
      await getDlList(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Bad Request');
    });

    it('skips non-fpk files', async () => {
      vi.mocked(fs.readdir).mockResolvedValue(['readme.txt', 'data.fpk'] as unknown as Awaited<ReturnType<typeof fs.readdir>>);
      vi.mocked(fs.stat).mockResolvedValue({ size: 512 } as Awaited<ReturnType<typeof fs.stat>>);

      const { req, res } = mockReqRes({ device_id: 2 });
      await getDlList(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          download_list: [expect.objectContaining({ path: '/data.fpk' })],
        }),
        res,
        req,
      );
    });

    it('returns empty list when directory does not exist', async () => {
      vi.mocked(fs.readdir).mockRejectedValue(new Error('ENOENT'));

      const { req, res } = mockReqRes({ device_id: 2 });
      await getDlList(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        { download_list: [] },
        res,
        req,
      );
    });
  });
});
