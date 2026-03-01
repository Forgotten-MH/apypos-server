import { Router } from 'express';
import * as dictionaryController from './dictionary.controller.js';

const dictionaryRouter = Router();

dictionaryRouter.post('/equipment/get', dictionaryController.getEquipment);

export default dictionaryRouter;
