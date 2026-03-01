import { Router } from 'express';
// notImplementedController available for unimplemented routes
import { premiumList } from './course.controller';

const courseRouter = Router();

courseRouter.post('/premium/list', premiumList);

export default courseRouter;
