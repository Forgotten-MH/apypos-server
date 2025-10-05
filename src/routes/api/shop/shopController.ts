import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";

export const karidamaInfo = (req: Request, res: Response) => {
  const data = {
    karidama_shop_infos: [
      {
        end_remain: 36000,
        mst_karidama_shop_id: 1,
        name: "karidama_shop",
        start_remain: 0,
      },
    ],
  };
  encryptAndSend(data, res, req);
};

export const karidamaList = (req: Request, res: Response) => {
  const data = {
    karidama_shop_items: [
      {
        detail: "detail",
        disp_item_contents: {
          payments: [
            {
              amount: 50,
              mst_payment_id: 1573159746,
            },
          ],
        },
        end_remain: 36000,
        flag_mst_shop_item_id: 0,
        item_contents: {
          payments: [
            {
              amount: 50,
              mst_payment_id: 1573159746,
            },
          ],
        },
        item_limit: 0,
        item_limit_max: 2,
        mst_shop_item_id: 0,
        name: "name",
        price: 0,
        shop_limit: 1,
        shop_limit_max: 4,
        shop_type: 0,
        start_remain: 0,
      },
    ],
    type_list: [
      {
        name: "test name",
        type: 0,
      },
    ],
  };
  encryptAndSend(data, res, req);
};

export const info = (req: Request, res: Response) => {
  const data = {
    high_upper_shop_info: {
      end_remain: 36000,
      mst_event_point_id: 3190222199,
      mst_shop_id: 1,
      name: "test1",
      start_remain: 0,
    },
    low_upper_shop_info: {
      end_remain: 36000,
      mst_event_point_id: 3190222199,
      mst_shop_id: 2,
      name: "test2",
      start_remain: 0,
    },
    shop_infos: [
      {
        end_remain: 36000,
        mst_event_point_id: 3190222199,
        mst_shop_id: 3,
        name: "test3",
        start_remain: 0,
      },
    ],
  };
  encryptAndSend(data, res, req);
};

export const list = (req: Request, res: Response) => {
  const data = {
    high_upper_shop_items: [
      {
        detail: "detail",
        disp_item_contents: {
          materials: [
            {
              amount: 1,
              mst_material_id: 3840285272,
            },
          ],
        },
        end_remain: 30000,
        filter_type: 0,
        item_contents: {
          materials: [
            {
              amount: 1,
              mst_material_id: 3840285272,
            },
          ],
        },
        item_limit: 1,
        item_limit_max: 1,
        mst_shop_item_id: 3840285272,
        name: "name",
        price: 1,
        shop_limit: 1,
        shop_limit_max: 1,
        start_remain: 0,
      },
    ],
    low_upper_shop_items: [
      {
        detail: "detail",
        disp_item_contents: {
          materials: [
            {
              amount: 1,
              mst_material_id: 3840285272,
            },
          ],
        },
        end_remain: 30000,
        filter_type: 0,
        item_contents: {
          materials: [
            {
              amount: 1,
              mst_material_id: 3840285272,
            },
          ],
        },
        item_limit: 1,
        item_limit_max: 1,
        mst_shop_item_id: 3840285272,
        name: "name",
        price: 1,
        shop_limit: 1,
        shop_limit_max: 1,
        start_remain: 0,
      },
    ],
    shop_items: [
      {
        detail: "detail",
        disp_item_contents: {
          materials: [
            {
              amount: 1,
              mst_material_id: 3840285272,
            },
          ],
        },
        end_remain: 30000,
        filter_type: 0,
        item_contents: {
          materials: [
            {
              amount: 1,
              mst_material_id: 3840285272,
            },
          ],
        },
        item_limit: 1,
        item_limit_max: 1,
        mst_shop_item_id: 3840285272,
        name: "name",
        price: 1,
        shop_limit: 1,
        shop_limit_max: 1,
        start_remain: 0,
      },
    ],
  };
  encryptAndSend(data, res, req);
};
export const buy = (req: Request, res: Response) => {
  const { amount, mst_shop_id, mst_shop_item_id } = req.body;
  const data = {
    item_contents: {
      materials: [
        {
          amount: 1,
          mst_material_id: 3840285272,
        },
      ],
    },
    payments: [],
  };
  encryptAndSend(data, res, req);
};
