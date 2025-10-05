import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";

export const capacityInfo = (req: Request, res: Response) => {
  const data = {
    max: 100,
    now: 0,
    price: 0,
  };
  encryptAndSend(data, res,req);
};
