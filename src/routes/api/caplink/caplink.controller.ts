import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";

export const pushRegister = (req: Request, res: Response) => {
  const data = {
    result:0
  };
  encryptAndSend(data, res,req);
};
export const pushSetting = (req: Request, res: Response) => {
  const data = {
    push_setting:{
      all:0,
      app:0,
      chat:0,
      frnd:0,
      game:0,
      profile:0,
      timeline:0,
    }
  };
  encryptAndSend(data, res,req);
};

export const pushModify = (req: Request, res: Response) => {
  const data = {
    result:0
  };
  encryptAndSend(data, res,req);
};