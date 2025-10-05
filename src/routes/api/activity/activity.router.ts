import { Router } from "express";
import * as activityController from "./activityController";

const activityRouter = Router();

activityRouter.post("/get", activityController.activityGet);

export default activityRouter;
