import { Router } from 'express';
import * as checkController from './check.controller.js';

const checkRouter = Router();

checkRouter.post('/nothing', checkController.nothing);

export default checkRouter;
