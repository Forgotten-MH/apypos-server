import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

import {
  getWebContent,
  getNoticeIndexOld,
  getNoticeIndex,
  getScheduleIndex,
  getScheduleIndexOld,
  getFirstDL,
} from './web.controller.js';

function mockReqRes() {
  const req = { ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {
    sendFile: vi.fn(),
    redirect: vi.fn(),
  } as unknown as Response;
  return { req, res };
}

describe('web.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getWebContent', () => {
    it('sends web-content.html file', () => {
      const { req, res } = mockReqRes();
      getWebContent(req, res);

      expect(res.sendFile).toHaveBeenCalledWith(
        expect.stringContaining('web-content.html'),
      );
    });
  });

  describe('getNoticeIndexOld', () => {
    it('sends notice-index-old.html file', () => {
      const { req, res } = mockReqRes();
      getNoticeIndexOld(req, res);

      expect(res.sendFile).toHaveBeenCalledWith(
        expect.stringContaining('notice-index-old.html'),
      );
    });
  });

  describe('getNoticeIndex', () => {
    it('redirects to hunters web info page', () => {
      const { req, res } = mockReqRes();
      getNoticeIndex(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining('#/info/top/3/0'),
      );
    });
  });

  describe('getScheduleIndex', () => {
    it('redirects to hunters web schedule page', () => {
      const { req, res } = mockReqRes();
      getScheduleIndex(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining('#/schedule/top'),
      );
    });
  });

  describe('getScheduleIndexOld', () => {
    it('sends schedule-index-old.html file', () => {
      const { req, res } = mockReqRes();
      getScheduleIndexOld(req, res);

      expect(res.sendFile).toHaveBeenCalledWith(
        expect.stringContaining('schedule-index-old.html'),
      );
    });
  });

  describe('getFirstDL', () => {
    it('sends first-dl.html file', () => {
      const { req, res } = mockReqRes();
      getFirstDL(req, res);

      expect(res.sendFile).toHaveBeenCalledWith(
        expect.stringContaining('first-dl.html'),
      );
    });
  });
});
