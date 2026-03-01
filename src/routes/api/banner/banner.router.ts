import { Router } from 'express';
import * as bannerController from './banner.controller';

const bannerRouter = Router();

bannerRouter.post('/dllist/get', bannerController.getDlList);

export default bannerRouter;
