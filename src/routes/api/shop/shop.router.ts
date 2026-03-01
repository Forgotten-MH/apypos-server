import { Router } from 'express';
import * as shopController from './shop.controller.js';
import { validate } from '../../../middleware/validation.js';
import { ShopBuySchema } from './shop.schema.js';

const shopRouter = Router();

shopRouter.post('/info', shopController.info);
shopRouter.post('/list', shopController.list);
shopRouter.post('/buy', validate(ShopBuySchema), shopController.buy);

shopRouter.post('/karidama/info', shopController.karidamaInfo);
shopRouter.post('/karidama/list', shopController.karidamaList);

export default shopRouter;
