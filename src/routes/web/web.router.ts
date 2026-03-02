import { Router } from 'express';
import * as webController from './web.controller.js';

const webRouter = Router();

webRouter.get('/notice/index', webController.getNoticeIndex);
webRouter.post('/notice/index', webController.getNoticeIndex);
webRouter.get('/schedule/index', webController.getScheduleIndex);
webRouter.post('/schedule/index', webController.getScheduleIndex);
webRouter.get('/notice/first_dl', webController.getFirstDL);
webRouter.get('/download', webController.getDownload);
webRouter.get('/*splat', webController.getWebContent);
webRouter.post('/*splat', webController.getWebContent);

export default webRouter;
