import { Router } from 'express';
import * as maintenanceEnvController from './maintenanceEnv.controller';
import * as webController from '../web/web.controller';

const maintenanceEnvRouter = Router();

maintenanceEnvRouter.get('/schedule', maintenanceEnvController.getMaintenanceEnvSchedule);
maintenanceEnvRouter.get('', webController.getWebContent);

export default maintenanceEnvRouter;
