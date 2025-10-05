import { Router } from "express";
import * as notImplemented from "../notImplementedController";
import * as shopController from "./shopController";

const shopRouter = Router();

shopRouter.post("/info", shopController.info);
shopRouter.post("/list", shopController.list);
shopRouter.post("/buy", shopController.buy);

shopRouter.post("/karidama/info", shopController.karidamaInfo);
shopRouter.post("/karidama/list",  shopController.karidamaList);

export default shopRouter;
