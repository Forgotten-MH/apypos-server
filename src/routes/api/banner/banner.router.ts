import { Router } from 'express';
import * as bannerController from './banner.controller.js';

const bannerRouter = Router();

bannerRouter.post('/dllist/get', bannerController.getDlList);

export default bannerRouter;
