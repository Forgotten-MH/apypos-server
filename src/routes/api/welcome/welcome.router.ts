import { Router } from 'express';
import * as welcomeController from './welcome.controller';

const welcomeRouter = Router();

welcomeRouter.post('/safety/flag/get', welcomeController.getSafetyFlag);
welcomeRouter.post('/safety/check', welcomeController.getSafetyCheck);

export default welcomeRouter;
