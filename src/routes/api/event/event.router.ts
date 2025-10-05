import { Router } from "express";
import * as eventController from "./eventController";
import * as notImplemented from "../notImplementedController";

const eventRouter = Router();

eventRouter.post("/info/get", eventController.infoGet);
eventRouter.post("/limitedskill/get", eventController.limitedskillGet);

export default eventRouter;
