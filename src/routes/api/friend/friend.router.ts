import { Router } from "express";
import * as notImplementedController from "../notImplementedController";
import { capacityInfo } from "./friend.controller";

const friendRouter = Router();

friendRouter.post("/capacity/info", capacityInfo);
// friendRouter.post("/acceptRequest", );
friendRouter.post("/listRequests", notImplementedController.blankResponseEncrypted);
friendRouter.post("/listFriends", notImplementedController.blankResponseEncrypted);

export default friendRouter;
