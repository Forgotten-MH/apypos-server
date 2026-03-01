import { Router } from 'express';
import * as popupController from './popup.controller.js';

const popupRouter = Router();

popupRouter.post('/record', popupController.record);

export default popupRouter;
