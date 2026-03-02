import { Router } from 'express';
import * as eventController from './event.controller.js';
import { validate } from '../../../middleware/validation.js';
import { SessionOnlySchema } from '../../../schemas/common.schema.js';

const eventRouter = Router();

eventRouter.post('/info/get', validate(SessionOnlySchema), eventController.infoGet);
eventRouter.post('/limitedskill/get', validate(SessionOnlySchema), eventController.limitedskillGet);

export default eventRouter;
