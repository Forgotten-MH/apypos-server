import { Router } from 'express';
import * as notImplementedController from '../notImplemented.controller.js';

const systemRouter = Router();
// SEEEMS TO ONLY ACTIVATE WHEN IN MULTIPLAYER....
systemRouter.post('/log', notImplementedController.blankResponseEncrypted);

export default systemRouter;
