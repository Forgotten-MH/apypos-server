import { Router } from 'express';
import * as bannerController from './banner.controller.js';
import { validate } from '../../../middleware/validation.js';
import { BannerDlListSchema } from './banner.schema.js';

const bannerRouter = Router();

bannerRouter.post('/dllist/get', validate(BannerDlListSchema), bannerController.getDlList);

export default bannerRouter;
