import { Request, Response } from "express";
import { encryptAndSend } from "../../services/crypto/encryptionHelpers";

export const blankResponseEncrypted = (req: Request, res: Response) => {
  const data = {};
  console.warn(
    "Using blank response to go forward this could have unintended side effects",
  );
  encryptAndSend(data, res,req);
};
export const blankResponse = (req: Request, res: Response) => {
  const data = {};
  console.warn(
    "Using blank response to go forward this could have unintended side effects",
  );
  res.status(200).header("Content-Type", "application/json").send(data);
};

