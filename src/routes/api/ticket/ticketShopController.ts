import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";

export const list = (req: Request, res: Response) => {
  const data = {
    ticket_list:[
      {
        buy_enabled:1,
        currency_type:1,
        mst_limited_id:581393666,
        pop_text:"pop_text",
        price:2,
        stock:1
      }
    ]
  };
  encryptAndSend(data, res,req);
};
