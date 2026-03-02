import { Router } from 'express';
import * as notImplementedController from '../notImplemented.controller.js';
import { capacityInfo } from './friend.controller.js';
import { validate } from '../../../middleware/validation.js';
import { SessionOnlySchema } from '../../../schemas/common.schema.js';

const friendRouter = Router();

friendRouter.post('/capacity/info', validate(SessionOnlySchema), capacityInfo);
// friendRouter.post("/acceptRequest", );
friendRouter.post('/listRequests', notImplementedController.blankResponseEncrypted);
friendRouter.post('/listFriends', notImplementedController.blankResponseEncrypted);

export default friendRouter;
