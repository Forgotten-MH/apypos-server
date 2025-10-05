import { Router } from "express";
import * as noticeController from "./noticeController";

const noticeRouter = Router();

noticeRouter.post("/get", noticeController.get);
// noticeRouter.post("/bannerlist/get", );

export default noticeRouter;
