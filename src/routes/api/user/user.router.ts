import { Router } from 'express';
import * as userController from './user.controller.js';
import * as userModelController from './model/userModel.controller.js';
import * as userOtomoTeamController from './otomoteam/userOtomoTeam.controller.js';
import * as userEquipSetController from './equipset/userEquipSet.controller.js';
import { validate } from '../../../middleware/validation.js';
import {
  SessionOnlySchema,
  RenameSchema,
  CommentSetSchema,
  TitleSetSchema,
  PartnerSetSchema,
  SearchUserIdSchema,
  SearchGameIdSchema,
} from './user.schema.js';
import { ModelCreateSchema, ModelSetSchema } from './model/userModel.schema.js';
import { EquipSetSetSchema, EquipSetSocialSetSchema } from './equipset/userEquipSet.schema.js';
import { OtomoTeamSetSchema, OtomoTeamSelectSchema } from './otomoteam/userOtomoTeam.schema.js';

const userRouter = Router();
//User
userRouter.post('/get', validate(SessionOnlySchema), userController.get);
userRouter.post('/rename', validate(RenameSchema), userController.rename);
//Comment
userRouter.post('/comment/set', validate(CommentSetSchema), userController.commentSet);
//Model
userRouter.post('/model/create', validate(ModelCreateSchema), userModelController.modelCreate);
userRouter.post('/model/set', validate(ModelSetSchema), userModelController.modelSet);
// userRouter.post("/model/buy", );

//OtomoTeam
userRouter.post('/otomoteam/get', validate(SessionOnlySchema), userOtomoTeamController.otomoteamGet);
userRouter.post('/otomoteam/set', validate(OtomoTeamSetSchema), userOtomoTeamController.otomoteamSet);
userRouter.post('/otomoteam/select', validate(OtomoTeamSelectSchema), userOtomoTeamController.otomoteamSelect);

//EquipSet
userRouter.post('/equipset/get', validate(SessionOnlySchema), userEquipSetController.equipSetGet);
userRouter.post('/equipset/set', validate(EquipSetSetSchema), userEquipSetController.equipSetSet);
userRouter.post('/equipset/social/get', validate(SessionOnlySchema), userEquipSetController.equipSetSocialGet);
userRouter.post('/equipset/social/set', validate(EquipSetSocialSetSchema), userEquipSetController.equipSetSocialSet);

//Nav
userRouter.post('/navigation/all', userController.navigationAll);
userRouter.post('/navigation/news', userController.navigationNews);
// userRouter.post("/navigation/reward/receive", );

//Title
userRouter.post('/title/all', userController.titleAll);
userRouter.post('/title/set', validate(TitleSetSchema), userController.titleSet);
userRouter.post('/title/news', userController.titleNews);
userRouter.post('/achievement/news', userController.achievementNews);
userRouter.post('/achievement/all', userController.achievementAll);
// userRouter.post("/achievement/apple/sync", );
// userRouter.post("/achievement/google/sync", );
// userRouter.post("/achievement/reward/receive", );
// userRouter.post("/all/reward/receive", );
// userRouter.post("/gender/change", );
// userRouter.post("/info", );

userRouter.post('/partner/set', validate(PartnerSetSchema), userController.partnerGet);

userRouter.post('/offer/check', userController.OfferCheck);
// userRouter.post("/offer/start", );

userRouter.post('/search/userID', validate(SearchUserIdSchema), userController.searchId);
userRouter.post('/search/gameID', validate(SearchGameIdSchema), userController.gameId);
export default userRouter;
