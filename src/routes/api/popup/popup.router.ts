import { Router } from "express";
import * as popupController from "./popupController";

const popupRouter = Router();

popupRouter.post("/record", popupController.record);

export default popupRouter;
