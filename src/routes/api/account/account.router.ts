import { Router } from 'express';
import * as accountController from './account.controller.js';
import { validate } from '../../../middleware/validation.js';
import { RegistSchema, LoginSchema, MigrationReadySchema, MigrationAuthSchema } from './account.schema.js';

const accountRouter = Router();

accountRouter.post('/regist', validate(RegistSchema), accountController.registerAccount);
accountRouter.post('/login', validate(LoginSchema), accountController.loginAccount);

// Data migration, top right corner on the main screen
accountRouter.post('/migration/ready', validate(MigrationReadySchema), accountController.migrationReady);
accountRouter.post('/migration/auth', validate(MigrationAuthSchema), accountController.migrationAuth);

export default accountRouter;
