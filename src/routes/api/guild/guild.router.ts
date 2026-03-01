import { Router } from 'express';
import {
  create,
  getUserGuild,
  userGet,
  userSetup,
  bingoGet,
  searchResult,
  searchId,
  apply,
  search,
  chatSend,
  chatGet,
  mailList,
  memberList,
} from './guild.controller.js';
import { validate } from '../../../middleware/validation.js';
import {
  SessionOnlySchema,
  CreateSchema,
  SearchIdSchema,
  ApplySchema,
  SearchSchema,
  ChatSendSchema,
  MemberListSchema,
} from './guild.schema.js';

const guildRouter = Router();

guildRouter.post('/user/get', validate(SessionOnlySchema), userGet);
guildRouter.post('/user/setup', validate(SessionOnlySchema), userSetup);
guildRouter.post('/get/user/guild', validate(SessionOnlySchema), getUserGuild);
guildRouter.post('/member/list', validate(MemberListSchema), memberList);

guildRouter.post('/create', validate(CreateSchema), create);

guildRouter.post('/search/result', validate(SessionOnlySchema), searchResult);
guildRouter.post('/search/ID', validate(SearchIdSchema), searchId);
guildRouter.post('/search', validate(SearchSchema), search);

guildRouter.post('/apply', validate(ApplySchema), apply);

guildRouter.post('/bingo/get', validate(SessionOnlySchema), bingoGet);

guildRouter.post('/user/mail/list', validate(SessionOnlySchema), mailList);
guildRouter.post('/chat/get', validate(SessionOnlySchema), chatGet);
guildRouter.post('/chat/send', validate(ChatSendSchema), chatSend);

export default guildRouter;
