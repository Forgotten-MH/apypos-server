import { Request, Response } from "express";
import { encryptAndSend } from "../../services/crypto/encryptionHelpers";
import { IP } from "../../config";

export const getMaintenanceEnvSchedule = (req: Request, res: Response) => {
  const data = {
    start: 0,
    end: 3600,
    url: `schedule/url`,
    master_list: [{ login_id: "" }, ],
  };
  encryptAndSend(data, res,req);
};
