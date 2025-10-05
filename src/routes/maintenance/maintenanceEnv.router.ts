import { Router } from "express";
import * as maintenanceEnvController from "./maintenanceEnvController";
import * as webController from "../web/webController";

const maintenanceEnvRouter = Router();

maintenanceEnvRouter.get(
  "/schedule",
  maintenanceEnvController.getMaintenanceEnvSchedule,
);
maintenanceEnvRouter.get(
  "",
  webController.getWebContent,
);

export default maintenanceEnvRouter;
