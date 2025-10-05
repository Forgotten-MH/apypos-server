import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";

export const getSafetyFlag = (req: Request, res: Response) => {
  const data = {
  };
  encryptAndSend(data, res,req);
};
