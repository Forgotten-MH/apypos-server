import { Router } from 'express';
import * as ticketController from './ticket.controller.js';

const ticketRouter = Router();

ticketRouter.post('/list', ticketController.list);

export default ticketRouter;
