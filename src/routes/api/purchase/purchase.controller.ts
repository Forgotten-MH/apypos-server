import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";

export const purchaseList = (req: Request, res: Response) => {
  const data = {
    bonus_stamp_info:[
      {
        display_idx:0,
        end:36000,
        mst_stamp_set_id:0,
        remain_time:36000,
        start:0
      }
    ],
    key:"test",
    offer_products:[
      {
        additional_point:1,
        additional_state:1,
        amount:1,
        banner:"banner",
        explain:"explain",
        id:"1",
        is_started:1,
        name:"name",
        remain:36000,
        start:0,
        state:1
      }
    ],
    products:[
      {
        additional_point:1,
        additional_state:1,
        amount:1,
        banner:1,
        explain:1,
        id:"1",
        increase_extra_date:"1",
        increase_extra_upper:"1",
        increase_state:1,
        original_amount:1,
        state:1
      }
    ],
    rest:1
  };
  encryptAndSend(data, res,req);
};
