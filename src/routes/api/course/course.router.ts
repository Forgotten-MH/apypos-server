import { Router } from 'express';
// notImplementedController available for unimplemented routes
import { premiumList } from './course.controller.js';
import { validate } from '../../../middleware/validation.js';
import { SessionOnlySchema } from '../../../schemas/common.schema.js';

const courseRouter = Router();

courseRouter.post('/premium/list', validate(SessionOnlySchema), premiumList);

export default courseRouter;
