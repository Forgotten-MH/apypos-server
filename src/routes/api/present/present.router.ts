import { Router } from 'express';
import { presentSync, presentReceive } from './present.controller.js';
import { validate } from '../../../middleware/validation.js';
import { SessionOnlySchema, PresentReceiveSchema } from './present.schema.js';

const presentRouter = Router();

presentRouter.post('/sync', validate(SessionOnlySchema), presentSync);
presentRouter.post('/receive', validate(PresentReceiveSchema), presentReceive);

export default presentRouter;
