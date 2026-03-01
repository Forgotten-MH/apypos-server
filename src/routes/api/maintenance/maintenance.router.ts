import { Router } from 'express';
import * as maintenanceController from './maintenance.controller';

const maintenanceRouter = Router();

maintenanceRouter.post('/check', maintenanceController.checkMaintenance);
maintenanceRouter.post('/titleimage/get', maintenanceController.getTitleImage);

export default maintenanceRouter;
