import { Router } from "express";
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
  memberList
} from "./guild.controller";

const guildRouter = Router();

guildRouter.post("/user/get", userGet);
guildRouter.post("/user/setup", userSetup);
guildRouter.post("/get/user/guild", getUserGuild);
guildRouter.post("/member/list", memberList);

guildRouter.post("/create", create);

guildRouter.post("/search/result", searchResult);
guildRouter.post("/search/ID", searchId);
guildRouter.post("/search", search);

guildRouter.post("/apply", apply);

guildRouter.post("/bingo/get", bingoGet);

guildRouter.post("/user/mail/list", mailList);
guildRouter.post("/chat/get", chatGet);
guildRouter.post("/chat/send", chatSend);

export default guildRouter;
