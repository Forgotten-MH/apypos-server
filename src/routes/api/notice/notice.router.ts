import { Router } from 'express';
import * as noticeController from './notice.controller.js';

const noticeRouter = Router();

noticeRouter.post('/get', noticeController.get);
// noticeRouter.post("/bannerlist/get", );

export default noticeRouter;
