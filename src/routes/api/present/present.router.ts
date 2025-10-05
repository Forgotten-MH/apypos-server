import { Router } from "express";
import { presentSync,presentReceive } from "./present.controller";

const presentRouter = Router();

presentRouter.post("/sync", presentSync);
presentRouter.post("/receive", presentReceive);

export default presentRouter;
