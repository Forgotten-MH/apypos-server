import mongoose from "mongoose";

const { Schema, model } = mongoose;

const guildMemberSchema = new Schema({
  created: { type: Number, default: 0 },
  last_login: { type: Number, default: 0 },
  uid: { type: String, default: "" },
});

const guildMemberListSchema = new Schema({
  leader: guildMemberSchema,
  normal: [guildMemberSchema],
  sub: [guildMemberSchema],
});

const guildChatMessageSchema = new Schema({
  uid: { type: String, default: "" },
  character_name: { type: String, default: "" },
  message: { type: String, required: true },
  timestamp: { type: Number, default: 0 },
});

const guildSchema = new Schema({
  gid: { type: String, default: "" },
  name: { type: String, default: "" },
  search_id: { type: String, default: "" },
  auto_recruit: { type: Number, default: 0 },
  chat_freq: { type: Number, default: 0 },
  login_freq: { type: Number, default: 0 },
  mood: { type: Number, default: 0 },
  recruit: { type: Number, default: 0 },
  timezone: { type: Number, default: 0 },
  yarikomi: { type: Number, default: 0 },
  member: guildMemberListSchema,
  updated: { type: Number, default: 0 },
  chat_messages: [guildChatMessageSchema],
  joined: { type: Number, default: 0 },
  free_comment: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  receive: {
    type: [{
      _id: { type: String, required: true },
      created: { type: Number, default: 0 },
      gid: { type: String, required: true },
      uid: { type: String, required: true },
    }],
    default: []
  },
  send: {
    type: [{
      _id: { type: String, required: true },
      created: { type: Number, default: 0 },
      gid: { type: String, required: true },
      uid: { type: String, required: true },
    }],
    default: []
  },
  explusion_rule: { type: Number, default: 0 },
  exp: { type: Number, default: 0 },
  created: { type: Number, default: 0 },
  comment: { type: String, default: "" },
  bonus_value: { type: Number, default: 0 },
  mark_box: { type: Number, default: 0 },
  bingo: { type: Number, default: 0 },
  holding_bingo_id: { type: String, default: "" },
  set_mark: { type: Number, default: 0 },
});

const Guild = model ("Guild", guildSchema);
export default Guild;
