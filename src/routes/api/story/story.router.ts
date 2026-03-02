import { Router } from 'express';
import * as storyController from './story.controller.js';
import { validate } from '../../../middleware/validation.js';
import { StoryEndSchema } from './story.schema.js';

const storyRouter = Router();

storyRouter.post('/end', validate(StoryEndSchema), storyController.end);

export default storyRouter;
