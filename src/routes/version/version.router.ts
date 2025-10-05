import { Router } from "express";
import * as versionController from "./versionController";

const versionRouter = Router();

versionRouter.get("/*.json", versionController.getVersionData);

export default versionRouter;
