import { Router } from "express";
import { pushModify, pushRegister, pushSetting } from "./caplink.controller";

const capLinkRouter = Router();

capLinkRouter.post("/push_register", pushRegister);
capLinkRouter.post("/push/setting", pushSetting); 
capLinkRouter.post("/push/modify",pushModify); 

export default capLinkRouter;
