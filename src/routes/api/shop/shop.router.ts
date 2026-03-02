import { Router } from 'express';
import * as shopController from './shop.controller.js';
import { validate } from '../../../middleware/validation.js';
import { ShopBuySchema } from './shop.schema.js';
import { SessionOnlySchema } from '../../../schemas/common.schema.js';

const shopRouter = Router();

shopRouter.post('/info', validate(SessionOnlySchema), shopController.info);
shopRouter.post('/list', validate(SessionOnlySchema), shopController.list);
shopRouter.post('/buy', validate(ShopBuySchema), shopController.buy);

shopRouter.post('/karidama/info', validate(SessionOnlySchema), shopController.karidamaInfo);
shopRouter.post('/karidama/list', validate(SessionOnlySchema), shopController.karidamaList);

export default shopRouter;
