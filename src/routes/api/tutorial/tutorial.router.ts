import { Router } from 'express';
import * as tutorialController from './tutorial.controller.js';
import { validate } from '../../../middleware/validation.js';
import { SessionOnlySchema, FlagSetSchema, QuestStartSchema } from './tutorial.schema.js';

const tutorialRouter = Router();

tutorialRouter.post('/flag/get', validate(SessionOnlySchema), tutorialController.getTutorialFlag);
tutorialRouter.post('/flag/set', validate(FlagSetSchema), tutorialController.TutorialFlagSet);
tutorialRouter.post('/step/up', validate(SessionOnlySchema), tutorialController.stepUP);

tutorialRouter.post('/quest/start', validate(QuestStartSchema), tutorialController.TutorialQuestStart);
tutorialRouter.post('/quest/end', validate(SessionOnlySchema), tutorialController.TutorialQuestEnd);

tutorialRouter.post('/nyanken/list', validate(SessionOnlySchema), tutorialController.nyankenList);
tutorialRouter.post('/nyanken/go', validate(SessionOnlySchema), tutorialController.nyankenGo);
tutorialRouter.post('/nyanken/result', validate(SessionOnlySchema), tutorialController.nyankenResult);

export default tutorialRouter;
