import { Router } from "express";
import * as notImplementedController from "../notImplementedController";
import { premiumList } from "./course.controller.";

const courseRouter = Router();

courseRouter.post("/premium/list", premiumList);
{}
export default courseRouter;
