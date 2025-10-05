import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";

export const nothing = (req: Request, res: Response) => {
  const data = {
    game_id: "09.03.06", //sServer::setupCheckAppVer(cMHiJessicaAPIResponseBase *)	.text	0000000001909B20	
  };
  encryptAndSend(data, res,req);
};
