import { Router } from 'express';
import * as nyankenController from './nyanken.controller.js';
// import * as notImplementedController from '../notImplemented.controller.js';

const nyankenRouter = Router();

nyankenRouter.post('/progress', nyankenController.progress);
nyankenRouter.post('/historyGet', nyankenController.historyGet);
nyankenRouter.post('/questlist', nyankenController.QuestList);
// nyankenRouter.post("/start", notImplementedController.blankResponseEncrypted);
nyankenRouter.post('/islandInfoGet', nyankenController.islandInfoGet);

export default nyankenRouter;
