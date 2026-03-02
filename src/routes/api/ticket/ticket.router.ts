import { Router } from 'express';
import * as ticketController from './ticket.controller.js';
import { validate } from '../../../middleware/validation.js';
import { SessionOnlySchema } from '../../../schemas/common.schema.js';

const ticketRouter = Router();

ticketRouter.post('/list', validate(SessionOnlySchema), ticketController.list);

export default ticketRouter;
