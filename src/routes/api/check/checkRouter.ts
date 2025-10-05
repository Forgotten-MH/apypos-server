import { Router } from "express";
import * as checkController from "./checkController";

const checkRouter = Router();

checkRouter.post("/nothing", checkController.nothing);

export default checkRouter;
