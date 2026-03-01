import { Router } from 'express';
import * as versionController from './version.controller.js';

const versionRouter = Router();

versionRouter.get('/*splat.json', versionController.getVersionData);

export default versionRouter;
