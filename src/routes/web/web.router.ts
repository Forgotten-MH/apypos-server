import { Router } from "express";
import * as webController from "./webController";

const webRouter = Router();

webRouter.get("/notice/index", webController.getNoticeIndex);
webRouter.post("/notice/index", webController.getNoticeIndex);
webRouter.get("/schedule/index", webController.getScheduleIndex);
webRouter.post("/schedule/index", webController.getScheduleIndex);
webRouter.get("/notice/first_dl", webController.getFirstDL);
// webRouter.get("/*", webController.getWebContent);
// webRouter.post("/*", webController.getWebContent);


export default webRouter;
