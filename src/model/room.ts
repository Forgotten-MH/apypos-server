import mongoose from "mongoose";

const { Schema, model } = mongoose;

export interface IRoomMember {
  user_id: string;
  character_name: string;
  game_id: string;
  joined_at: Date;
  is_ready: boolean;
  equipment_info?: {
    social_equip: {
      social_arm: { equipment_id: string; mst_equipment_id: number };
      social_body: { equipment_id: string; mst_equipment_id: number };
      social_head: { equipment_id: string; mst_equipment_id: number };
      social_leg: { equipment_id: string; mst_equipment_id: number };
      social_waist: { equipment_id: string; mst_equipment_id: number };
    };
  };
}

export interface RoomInfo {
  _id: string;
  room_id: number;
  host_id: string;
  host_name: string;
  name: string;
  quest_id: number;
  phase: number;
  is_locked: number;
  member_count: number;
  members: string[];
  auto_flag: number;
  quick_match: number;
  kick: number;
  restart: number;
  tag: number;
  reserve_members: string[];
  server_url: string;
  type: number;
  created: number;
}

export interface RoomCreationData {
  host_id: string;
  host_name: string;
  room_name: string;
  quest_id: number;
  quest_name?: string;
  auto_flag?: number;
  quick_match?: number;
  kick?: number;
  restart?: number;
  tag?: number;
  max_members?: number;
  is_private?: boolean;
  is_locked?: boolean;
  description?: string;
  server_url: string;
  type?: number;
  reserve_members?: string[];
}

export interface IRoom extends mongoose.Document {
  room_id: number;
  host_id: string;
  host_name: string;
  room_name: string;
  quest_id: number;
  quest_name: string;
  phase: number;
  is_locked: boolean;
  is_private: boolean;
  max_members: number;
  member_count: number;
  members: mongoose.Types.DocumentArray<IRoomMember>;
  reserve_members: string[];
  auto_flag: number;
  quick_match: number;
  kick: number;
  restart: number;
  tag: number;
  server_url: string;
  type: number;
  description: string;
  password: string;
  created_at: Date;
  updated_at: Date;
  last_activity: Date;
  total_quests: number;
  successful_quests: number;

  is_full: boolean;
  is_active: boolean;

  addMember(userId: string, characterName: string, gameId: string): IRoom;
  removeMember(userId: string): IRoom;
  setMemberReady(userId: string, isReady: boolean): IRoom;
  allMembersReady(): boolean;
  toRoomInfo(): RoomInfo;
}

interface IRoomModel extends mongoose.Model<IRoom> {
  findAvailableRooms(questId?: number, maxMembers?: number): Promise<IRoom[]>;
  createRoom(roomData: RoomCreationData): Promise<IRoom>;
  cleanupExpiredRooms(): Promise<mongoose.mongo.DeleteResult>;
  cleanupUserRooms(userId: string): Promise<mongoose.mongo.DeleteResult>;
}

const RoomMemberSchema = new Schema({
  user_id: { type: String, required: true },
  character_name: { type: String, required: true },
  game_id: { type: String, required: true },
  joined_at: { type: Date, default: Date.now },
  is_ready: { type: Boolean, default: false },
  equipment_info: {
    social_equip: {
      social_arm: { equipment_id: String, mst_equipment_id: Number },
      social_body: { equipment_id: String, mst_equipment_id: Number },
      social_head: { equipment_id: String, mst_equipment_id: Number },
      social_leg: { equipment_id: String, mst_equipment_id: Number },
      social_waist: { equipment_id: String, mst_equipment_id: Number },
    }
  }
}, { _id: false });

const RoomSchema = new Schema<IRoom, IRoomModel>({
  room_id: { type: Number, required: true, unique: true },
  host_id: { type: String, required: true },
  host_name: { type: String, required: true },
  room_name: { type: String, required: true },
  quest_id: { type: Number, required: true },
  quest_name: { type: String, default: "" },

  phase: { type: Number, default: 0 },
  is_locked: { type: Boolean, default: false },
  is_private: { type: Boolean, default: false },

  max_members: { type: Number, default: 4 },
  auto_flag: { type: Number, default: 0 },
  quick_match: { type: Number, default: 0 },
  kick: { type: Number, default: 0 },
  restart: { type: Number, default: 0 },
  tag: { type: Number, default: 0 },

  members: [RoomMemberSchema],
  member_count: { type: Number, default: 0 },

  reserve_members: [String],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  last_activity: { type: Date, default: Date.now },

  server_url: { type: String, required: true },
  type: { type: Number, default: 1 },

  description: { type: String, default: "" },
  password: { type: String, default: "" },

  total_quests: { type: Number, default: 0 },
  successful_quests: { type: Number, default: 0 },

}, {
  timestamps: false,
  collection: 'rooms'
});

RoomSchema.index({ host_id: 1 });
RoomSchema.index({ quest_id: 1 });
RoomSchema.index({ phase: 1 });
RoomSchema.index({ is_locked: 1 });
RoomSchema.index({ created_at: -1 });
RoomSchema.index({ last_activity: -1 });

RoomSchema.virtual('is_full').get(function () {
  return this.member_count >= this.max_members;
});

RoomSchema.virtual('is_active').get(function () {
  const now = new Date();
  const inactiveTime = 30 * 60 * 1000;
  return (now.getTime() - this.last_activity.getTime()) < inactiveTime;
});

RoomSchema.methods.addMember = function (this: IRoom, userId: string, characterName: string, gameId: string) {
  if (this.is_full) {
    throw new Error('Room is full');
  }

  if (this.members.some((member) => member.user_id === userId)) {
    throw new Error('User already in room');
  }

  this.members.push({
    user_id: userId,
    character_name: characterName,
    game_id: gameId,
    joined_at: new Date(),
    is_ready: false
  });

  this.member_count = this.members.length;
  this.last_activity = new Date();
  this.updated_at = new Date();

  return this;
};

RoomSchema.methods.removeMember = function (this: IRoom, userId: string) {
  const memberIndex = this.members.findIndex((member) => member.user_id === userId);
  if (memberIndex === -1) {
    throw new Error('User not in room');
  }

  const wasHost = this.host_id === userId;

  this.members.splice(memberIndex, 1);
  this.member_count = this.members.length;
  this.last_activity = new Date();
  this.updated_at = new Date();

  if (wasHost) {
    console.log(`[Room Model] Host ${userId} left room ${this.room_id}, marking for deletion`);
    this.phase = -1;
    return this;
  }

  if (this.member_count === 0) {
    console.log(`[Room Model] Room ${this.room_id} is now empty, marking for deletion`);
    this.phase = -1;
    return this;
  }

  return this;
};

RoomSchema.methods.setMemberReady = function (this: IRoom, userId: string, isReady: boolean) {
  const member = this.members.find((member) => member.user_id === userId);
  if (!member) {
    throw new Error('User not in room');
  }

  member.is_ready = isReady;
  this.last_activity = new Date();
  this.updated_at = new Date();

  return this;
};

RoomSchema.methods.allMembersReady = function (this: IRoom) {
  return this.members.every((member) => member.is_ready);
};

RoomSchema.methods.toRoomInfo = function (this: IRoom): RoomInfo {
  return {
    _id: this._id.toString(),
    room_id: this.room_id,
    host_id: this.host_id,
    host_name: this.host_name,
    name: this.room_name,
    quest_id: this.quest_id,
    phase: this.phase,
    is_locked: this.is_locked ? 1 : 0,
    member_count: this.member_count,
    members: this.members.map((m) => m.user_id),
    auto_flag: this.auto_flag,
    quick_match: this.quick_match,
    kick: this.kick,
    restart: this.restart,
    tag: this.tag,
    reserve_members: this.reserve_members,
    server_url: this.server_url,
    type: this.type,
    created: Math.floor(this.created_at.getTime() / 1000),
  };
};


RoomSchema.statics.findAvailableRooms = function (this: IRoomModel, questId?: number, maxMembers?: number) {
  const query: mongoose.QueryFilter<IRoom> = {
    phase: 0,
    is_locked: false,
    is_private: false,
    $expr: { $lt: ['$member_count', '$max_members'] },
    ...(questId ? { quest_id: questId } : {}),
    ...(maxMembers ? { max_members: { $gte: maxMembers } } : {}),
  };

  return this.find(query)
    .sort({ created_at: -1 })
    .limit(20);
};

RoomSchema.statics.createRoom = async function (this: IRoomModel, roomData: RoomCreationData) {
  const lastRoom = await this.findOne().sort({ room_id: -1 });
  const roomId = lastRoom ? lastRoom.room_id + 1 : 1000;

  const room = new this({
    ...roomData,
    room_id: roomId,
    member_count: 0
  });

  return await room.save();
};

RoomSchema.statics.cleanupExpiredRooms = function (this: IRoomModel) {
  const now = new Date();
  const expiredTime = new Date(now.getTime() - 30 * 60 * 1000);

  console.log(`[Room Cleanup] Cleaning rooms with last_activity before: ${expiredTime.toISOString()}`);

  return this.deleteMany({
    $or: [
      {
        phase: -1
      },
      {
        last_activity: { $lt: expiredTime },
        phase: { $in: [0, 1] }
      },
      {
        member_count: 0,
        phase: { $in: [0, 1] }
      },
      {
        last_activity: { $lt: new Date(now.getTime() - 60 * 60 * 1000) },
        phase: { $in: [2, 3] }
      }
    ]
  });
};

RoomSchema.statics.cleanupUserRooms = function (this: IRoomModel, userId: string) {
  console.log(`[Room Cleanup] Cleaning rooms for user: ${userId}`);

  return this.deleteMany({
    $or: [
      { host_id: userId },
      { "members.user_id": userId }
    ]
  });
};

const Room = model<IRoom, IRoomModel>("Room", RoomSchema);
export default Room;
