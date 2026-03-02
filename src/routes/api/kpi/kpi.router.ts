import { Router } from 'express';
import * as notImplementedController from '../notImplemented.controller.js';

const kpiRouter = Router();

kpiRouter.post('/send', notImplementedController.blankResponseEncrypted);

export default kpiRouter;
