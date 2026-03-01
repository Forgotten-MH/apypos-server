import { Router } from 'express';
import * as noticeController from './notice.controller.js';
import { validate } from '../../../middleware/validation.js';
import { SessionOnlySchema } from './notice.schema.js';

const noticeRouter = Router();

noticeRouter.post('/get', validate(SessionOnlySchema), noticeController.get);
// noticeRouter.post("/bannerlist/get", );

export default noticeRouter;
