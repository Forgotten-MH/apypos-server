import { Router } from "express";
import * as notImplemented from "../notImplementedController";
import { create, getUserGuild, userGet, userSetup,bingoGet, searchResult, searchId } from "./guild.controller";

const guildRouter = Router();

guildRouter.post("/user/get", userGet);
guildRouter.post("/user/setup", userSetup);
guildRouter.post("/get/user/guild", getUserGuild);
guildRouter.post("/create", create);
guildRouter.post("/bingo/get", bingoGet);
guildRouter.post("/search/result", searchResult);
guildRouter.post("/user/mail/list", notImplemented.blankResponseEncrypted);
guildRouter.post("/search/ID",searchId);
guildRouter.post("/apply", notImplemented.blankResponseEncrypted);
guildRouter.post("/search", notImplemented.blankResponseEncrypted);
guildRouter.post("/chat/get", notImplemented.blankResponseEncrypted); //causes crash



export default guildRouter;
