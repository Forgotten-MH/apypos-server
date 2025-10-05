import { Router } from "express";
import * as ticketShopController from "./ticketShopController";

const ticketRouter = Router();

ticketRouter.post("/list", ticketShopController.list);

export default ticketRouter;
