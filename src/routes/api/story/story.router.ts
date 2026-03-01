import { Router } from 'express';
import * as storyController from './story.controller';
const storyRouter = Router();

storyRouter.post('/end', storyController.end);

export default storyRouter;
