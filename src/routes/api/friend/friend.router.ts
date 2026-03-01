import { Router } from 'express';
import * as notImplementedController from '../notImplemented.controller.js';
import { capacityInfo } from './friend.controller.js';

const friendRouter = Router();

friendRouter.post('/capacity/info', capacityInfo);
// friendRouter.post("/acceptRequest", );
friendRouter.post('/listRequests', notImplementedController.blankResponseEncrypted);
friendRouter.post('/listFriends', notImplementedController.blankResponseEncrypted);

export default friendRouter;
