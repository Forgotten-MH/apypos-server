import { Router } from "express";
import * as accountController from "./account.controller";

const accountRouter = Router();

accountRouter.post("/regist", accountController.registerAccount);
accountRouter.post("/login", accountController.loginAccount);

// Data migration, top right corner on the main screen
accountRouter.post("/migration/ready", accountController.migrationReady);
accountRouter.post("/migration/auth", accountController.migrationAuth);

export default accountRouter;
