import { Router } from 'express';
import * as activityController from './activity.controller.js';
import { validate } from '../../../middleware/validation.js';
import { SessionOnlySchema } from '../../../schemas/common.schema.js';

const activityRouter = Router();

activityRouter.post('/get', validate(SessionOnlySchema), activityController.activityGet);

export default activityRouter;
