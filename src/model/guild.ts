import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const GuildMemberSchema = new Schema({
  created: { type: Number, default: 0 },
  last_login: { type: Number, default: 0 },
  uid: { type: String, required: true },
}, { _id: false });

const GuildMemberConfigSchema = new Schema({
  leader: { type: GuildMemberSchema, required: true },
  normal: { type: [GuildMemberSchema], default: [] },
  sub: { type: [GuildMemberSchema], default: [] },
}, { _id: false });
  
const GuildRequestSchema = new Schema({
  _id: { type: String, required: true },
  created: { type: Number, default: 0 },
  gid: { type: String, required: true },
  uid: { type: String, required: true },
}, { _id: false });

const GuildChatMessageSchema = new Schema({
  uid: { type: String, required: true },
  character_name: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Number, default: () => Date.now() },
}, { _id: false });

const GuildSchema = new Schema({
  gid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  search_id: { type: String, default: '' },
  auto_recruit: { type: Number, default: 0 },
  recruit: { type: Number, default: 0 },
  explusion_rule: { type: Number, default: 0 },
  login_freq: { type: Number, default: 0 },
  chat_freq: { type: Number, default: 0 },
  yarikomi: { type: Number, default: 0 },
  mood: { type: Number, default: 0 },
  timezone: { type: Number, default: 0 },
  comment: { type: String, default: '' },
  free_comment: { type: String, default: '' },
  rank: { type: Number, default: 0 },
  exp: { type: Number, default: 0 },
  joined: { type: Number, default: 0 },
  member: { type: GuildMemberConfigSchema, required: true },
  
  holding_bingo_id: { type: Number, default: 0 },
  bingo: { type: [Number], default: [] },
  mark_box: { type: [Number], default: [] },
  set_mark: { type: Number, default: 0 },
  bonus_value: { type: Number, default: 0 },
  receive: { type: [GuildRequestSchema], default: [] },
  send: { type: [GuildRequestSchema], default: [] },
  chat_messages: { type: [GuildChatMessageSchema], default: [] },
  created: { type: Number, default: () => Date.now() },
  updated: { type: Number, default: () => Date.now() },
});

GuildSchema.index({ search_id: 1 });
GuildSchema.index({ name: 1 });

const Guild = model('Guild', GuildSchema);
export default Guild;

