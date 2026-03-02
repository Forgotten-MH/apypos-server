import { Router } from 'express';
import * as maintenanceEnvController from './maintenanceEnv.controller.js';
import * as webController from '../web/web.controller.js';

const maintenanceEnvRouter = Router();

maintenanceEnvRouter.get('/schedule', maintenanceEnvController.getMaintenanceEnvSchedule);
maintenanceEnvRouter.get('', webController.getWebContent);

export default maintenanceEnvRouter;
