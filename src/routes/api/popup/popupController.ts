import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";

export const record = (req: Request, res: Response) => {
  const data = {
   //Logs the request body 
   //ids: [ '1' ],
  //type: 3
  // Must keep an array in server with a list of web page pop ups and this tells the server its been viewed.
  };
  encryptAndSend(data, res,req);
};
