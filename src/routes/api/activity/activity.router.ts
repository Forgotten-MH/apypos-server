import { Router } from 'express';
import * as activityController from './activity.controller';

const activityRouter = Router();

activityRouter.post('/get', activityController.activityGet);

export default activityRouter;
