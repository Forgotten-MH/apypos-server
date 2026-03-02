import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';

vi.mock('../../../services/crypto/encryptionHelpers');

import { encryptAndSend } from '../../../services/crypto/encryptionHelpers.js';
import {
  karidamaInfo,
  karidamaList,
  info,
  list,
  buy,
} from './shop.controller.js';

function mockReqRes(body: Record<string, unknown> = {}) {
  const req = { body, ip: '127.0.0.1', get: vi.fn() } as unknown as Request;
  const res = {} as Response;
  return { req, res };
}

describe('shop.controller', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('karidamaInfo', () => {
    it('returns karidama shop info list', () => {
      const { req, res } = mockReqRes();
      karidamaInfo(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          karidama_shop_infos: expect.arrayContaining([
            expect.objectContaining({
              mst_karidama_shop_id: 1,
              name: 'karidama_shop',
            }),
          ]),
        }),
        res,
        req,
      );
    });
  });

  describe('karidamaList', () => {
    it('returns karidama shop items and type list', () => {
      const { req, res } = mockReqRes();
      karidamaList(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          karidama_shop_items: expect.arrayContaining([
            expect.objectContaining({
              mst_shop_item_id: 0,
              name: 'name',
              shop_type: 0,
            }),
          ]),
          type_list: expect.arrayContaining([
            expect.objectContaining({ name: 'test name', type: 0 }),
          ]),
        }),
        res,
        req,
      );
    });
  });

  describe('info', () => {
    it('returns shop infos with high/low upper shops', () => {
      const { req, res } = mockReqRes();
      info(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          high_upper_shop_info: expect.objectContaining({
            mst_shop_id: 1,
            name: 'test1',
          }),
          low_upper_shop_info: expect.objectContaining({
            mst_shop_id: 2,
            name: 'test2',
          }),
          shop_infos: expect.arrayContaining([
            expect.objectContaining({ mst_shop_id: 3, name: 'test3' }),
          ]),
        }),
        res,
        req,
      );
    });
  });

  describe('list', () => {
    it('returns shop items for all categories', () => {
      const { req, res } = mockReqRes();
      list(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          high_upper_shop_items: expect.any(Array),
          low_upper_shop_items: expect.any(Array),
          shop_items: expect.arrayContaining([
            expect.objectContaining({
              mst_shop_item_id: 3840285272,
              price: 1,
            }),
          ]),
        }),
        res,
        req,
      );
    });
  });

  describe('buy', () => {
    it('returns item contents and empty payments', () => {
      const { req, res } = mockReqRes({
        amount: 1,
        mst_shop_id: 3,
        mst_shop_item_id: 3840285272,
      });
      buy(req, res);

      expect(encryptAndSend).toHaveBeenCalledWith(
        expect.objectContaining({
          item_contents: expect.objectContaining({
            materials: expect.arrayContaining([
              expect.objectContaining({ mst_material_id: 3840285272 }),
            ]),
          }),
          payments: [],
        }),
        res,
        req,
      );
    });
  });
});
