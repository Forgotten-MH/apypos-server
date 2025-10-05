import { Request, Response } from "express";
import { encryptAndSend } from "../../../services/crypto/encryptionHelpers";
import { IS_MAINTENANCE } from "../../../config";


export const checkMaintenance = (req: Request, res: Response) => {
  const data = {
    is_maintenance: IS_MAINTENANCE,  //0 false 1 true
    title_banner: {
      banner_id: "btop_0204403",
      timeLeft: 305030301,
      type: 1,
      url: "gettitle",  
    },
    web_url: "maintenance",  // would become "/web/maintenance?login_id=login_id_on_reg&sec_id=pmRMLkbHtuxw&device_id=2" triggered when is_maintenance is 1
  };
  encryptAndSend(data, res,req);
};

export const getTitleImage = (req: Request, res: Response) => {
  const data = {
    title_banner: {
      banner_id: "btop_0204403",
      timeLeft: 305030301,
      type: 1,
      url: "http://localhost/",  
    },
    title_image: {
      mst_title_image_id: 0,//0 Forbidden Ground //1 normal
      mst_title_logo_id: 0, //0 Forbidden Ground //1 normal
    },
  };
  encryptAndSend(data, res,req);
};
