import { Router } from 'express';
import * as dictionaryController from './dictionary.controller.js';
import { validate } from '../../../middleware/validation.js';
import { SessionOnlySchema } from '../../../schemas/common.schema.js';

const dictionaryRouter = Router();

dictionaryRouter.post('/equipment/get', validate(SessionOnlySchema), dictionaryController.getEquipment);

export default dictionaryRouter;
