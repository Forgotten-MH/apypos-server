import { Router } from 'express';
import * as notImplementedController from '../notImplemented.controller';
import { purchaseList } from './purchase.controller';

const purchaseRouter = Router();

purchaseRouter.post('/list', purchaseList);

purchaseRouter.post('/tutorial', notImplementedController.blankResponseEncrypted);
purchaseRouter.post('/validate', notImplementedController.blankResponseEncrypted);
export default purchaseRouter;
