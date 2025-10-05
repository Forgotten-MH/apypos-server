import { Router } from "express";
import * as notImplementedController from "../notImplementedController";

const systemRouter = Router();
// SEEEMS TO ONLY ACTIVATE WHEN IN MULTIPLAYER....
systemRouter.post("/log", notImplementedController.blankResponseEncrypted);

export default systemRouter;
