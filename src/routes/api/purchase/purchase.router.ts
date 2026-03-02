import { Router } from 'express';
import * as notImplementedController from '../notImplemented.controller.js';
import { purchaseList } from './purchase.controller.js';
import { validate } from '../../../middleware/validation.js';
import { SessionOnlySchema } from '../../../schemas/common.schema.js';

const purchaseRouter = Router();

purchaseRouter.post('/list', validate(SessionOnlySchema), purchaseList);

purchaseRouter.post('/tutorial', notImplementedController.blankResponseEncrypted);
purchaseRouter.post('/validate', notImplementedController.blankResponseEncrypted);
export default purchaseRouter;
