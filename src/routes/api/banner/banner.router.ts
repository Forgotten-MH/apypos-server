import { Router } from "express";
import * as bannerController from "./bannerController";

const bannerRouter = Router();

bannerRouter.post("/dllist/get", bannerController.getDlList);

export default bannerRouter;
