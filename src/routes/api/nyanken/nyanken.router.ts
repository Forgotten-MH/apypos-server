import { Router } from 'express';
import * as nyankenController from './nyanken.controller.js';
import { validate } from '../../../middleware/validation.js';
import { SessionOnlySchema } from '../../../schemas/common.schema.js';
// import * as notImplementedController from '../notImplemented.controller.js';

const nyankenRouter = Router();

nyankenRouter.post('/progress', validate(SessionOnlySchema), nyankenController.progress);
nyankenRouter.post('/historyGet', validate(SessionOnlySchema), nyankenController.historyGet);
nyankenRouter.post('/questlist', validate(SessionOnlySchema), nyankenController.QuestList);
// nyankenRouter.post("/start", notImplementedController.blankResponseEncrypted);
nyankenRouter.post('/islandInfoGet', validate(SessionOnlySchema), nyankenController.islandInfoGet);

export default nyankenRouter;
