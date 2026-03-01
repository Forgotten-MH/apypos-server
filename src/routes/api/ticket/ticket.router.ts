import { Router } from 'express';
import * as ticketController from './ticket.controller';

const ticketRouter = Router();

ticketRouter.post('/list', ticketController.list);

export default ticketRouter;
