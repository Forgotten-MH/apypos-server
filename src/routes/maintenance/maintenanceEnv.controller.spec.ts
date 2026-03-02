import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../services/crypto/encryptionHelpers');

import { encryptAndSend } from '../../services/crypto/encryptionHelpers.js';
import { getMaintenanceEnvSchedule } from './maintenanceEnv.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('maintenanceEnv.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getMaintenanceEnvSchedule', () => {
    it('returns schedule with start, end, and master list', () => {
      const { req, res } = mockReqRes();
      getMaintenanceEnvSchedule(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        {
          start: 0,
          end: 3600,
          url: 'schedule/url',
          master_list: [{ login_id: '' }],
        },
        res,
        req,
      );
    });
  });
});
