import mongoose, { Document } from 'mongoose';
import OceanSchema from './ocean.js';
import equipmentSchema from './items/equipment.js';
import growthItemSchema from './items/growth_item.js';
import limitedSchema from './items/limited.js';
import matatabiSchema from './items/matatabi.js';
import materialSchema from './items/material.js';
import paymentSchema from './items/payment.js';
import pointSchema from './items/point.js';
import powerSchema from './items/power.js';
import augiteSchema from './items/augite.js';
import otomoSchema from './sidekicks/otomo.js';
import partnerSchema from './sidekicks/partner.js';
import otomoTeamSchema from './sidekicks/otomoTeam.js';
import type {
  Box,
  Ocean,
  ClearedQuest,
  EquipSet,
  SocialEquipset,
  OtomoTeam,
  ModelInfo,
  GuildInfo,
  NyankenCooldown,
  SelectedPartner,
} from '../types/game.js';
import {
  DEFAULT_EQUIPMENT,
  DEFAULT_OTOMOS,
  DEFAULT_PARTNERS,
  DEFAULT_EQUIPSET,
  DEFAULT_SOCIAL_EQUIP_SETS,
  DEFAULT_OTOMOTEAM,
  DEFAULT_OCEAN_LIST,
} from './defaults/user.defaults.js';
const { Schema, model } = mongoose;

export interface IUser extends Document {
  uu_id?: string;
  secret_id?: string;
  login_id?: string;
  transfer?: {
    mst_himitsu_question_id?: string;
    himitsu_answer?: string;
    migration_pass?: string;
    migration_id?: string;
  };
  user_id?: string;
  game_id?: string;
  tutorial_step?: number;
  character_name?: string;
  current_session?: string;
  comment?: string;
  tutorial_flags: number[];
  model_info?: ModelInfo;
  box?: Box;
  equipset?: {
    capacity_eqp_set: number;
    equip_sets: EquipSet[];
    selected_equip_set_index: number;
  };
  social_equip_sets?: SocialEquipset[];
  otomoteam?: {
    capacity: number;
    otomo_team: OtomoTeam[];
    selected_index: number;
  };
  selected_partner?: SelectedPartner;
  ocean_list: Ocean[];
  cleared_quests: ClearedQuest[];
  nyanken_cooldown?: NyankenCooldown;
  equipment_id_counter?: number;
  guild_info?: GuildInfo;
}
const equipPieceSchema = new Schema({
  created: Number,
  equipment_id: { type: String, default: 'NO_EQUIP' },
  level: Number,
  mst_equipment_id: Number,
  potential: Number,
  skill_level: Number,
});

const equipSetPieceSchema = new Schema({
  equipment_id: { type: String, default: 'NO_EQUIP' },
});
const ClearedQuests = new mongoose.Schema({
  mst_quest_id: {
    type: Number,
    required: true,
  },
  clear_time: {
    type: Number,
    required: false,
  },
});
const equipsetSchema = new Schema({
  index: { type: Number, default: 1 },
  partner_equip_sets: [
    {
      mst_partner_id: Number,
      arm: equipPieceSchema,
      body: equipPieceSchema,
      leg: equipPieceSchema,
      head: equipPieceSchema,
      secret_weapon: equipPieceSchema,
      talisman: equipPieceSchema,
      waist: equipPieceSchema,
      weapon: equipPieceSchema,
    },
  ],
  arm: equipSetPieceSchema,
  body: equipSetPieceSchema,
  leg: equipSetPieceSchema,
  head: equipSetPieceSchema,
  secret_weapon: equipSetPieceSchema,
  talisman: equipSetPieceSchema,
  waist: equipSetPieceSchema,
  weapon: equipSetPieceSchema,
});

const SocialEquipPartSchema = new Schema(
  {
    equipment_id: { type: String, required: true },
    mst_equipment_id: { type: Number, required: true },
  },
  { _id: false },
);

// Define the full SocialEquipset schema
const SocialEquipsetSchema = new Schema(
  {
    gunner: {
      social_arm: { type: SocialEquipPartSchema, required: true },
      social_body: { type: SocialEquipPartSchema, required: true },
      social_head: { type: SocialEquipPartSchema, required: true },
      social_leg: { type: SocialEquipPartSchema, required: true },
      social_waist: { type: SocialEquipPartSchema, required: true },
    },
    knight: {
      social_arm: { type: SocialEquipPartSchema, required: true },
      social_body: { type: SocialEquipPartSchema, required: true },
      social_head: { type: SocialEquipPartSchema, required: true },
      social_leg: { type: SocialEquipPartSchema, required: true },
      social_waist: { type: SocialEquipPartSchema, required: true },
    },
    is_used: { type: Number, required: true },
    mst_partner_id: { type: Number, required: true },
  },
  { _id: false },
);

const userSchema = new Schema({
  uu_id: String,
  secret_id: String,
  login_id: String,
  transfer: {
    mst_himitsu_question_id: String,
    himitsu_answer: String,
    migration_pass: String,
    migration_id: String,
  },
  user_id: String,
  game_id: String,
  tutorial_step: Number,
  character_name: String,
  current_session: String,
  comment: String,
  tutorial_flags: [Number],
  model_info: {
    face: Number,
    gender: Number,
    hair: Number,
    hair_color: Number,
    inner: Number,
    skin: Number,
  },
  box: {
    capacity: {
      eqp_box: { type: Number, default: 100 },
      eqp_set: { type: Number, default: 100 },
      friend_max: { type: Number, default: 100 },
    },
    equipments: {
      type: [equipmentSchema],
      default: DEFAULT_EQUIPMENT,
    },
    growth_items: [growthItemSchema],
    limiteds: [limitedSchema],
    matatabis: [matatabiSchema],
    materials: [materialSchema],
    monument: {
      augite: [augiteSchema],
      hr: { type: Number, default: 0 },
      mlv: {
        atk: { type: Number, default: 0 },
        def: { type: Number, default: 0 },
        hp: { type: Number, default: 0 },
        sp: { type: Number, default: 0 },
      },
    },
    otomos: {
      type: [otomoSchema],
      default: DEFAULT_OTOMOS,
    },
    partners: {
      type: [partnerSchema],
      default: DEFAULT_PARTNERS,
    },
    payments: [paymentSchema],
    points: [pointSchema],
    powers: [powerSchema],
    zeny: { type: Number, default: 100000 },
  },
  equipset: {
    capacity_eqp_set: { type: Number, default: 5 },
    equip_sets: {
      type: [equipsetSchema],
      default: DEFAULT_EQUIPSET,
    },
    selected_equip_set_index: { type: Number, default: 1 },
  },
  social_equip_sets: {
    type: [SocialEquipsetSchema],
    default: DEFAULT_SOCIAL_EQUIP_SETS,
  },
  otomoteam: {
    capacity: { type: Number, default: 1 },
    otomo_team: {
      type: [otomoTeamSchema],
      default: DEFAULT_OTOMOTEAM,
    },
    selected_index: { type: Number, default: 1 },
  },
  selected_partner: {
    main_partner_id: { type: String, default: 'PT_CHAR_ID_001' },
    quest_partner_id: { type: String, default: 'PT_CHAR_ID_001' },
  },
  ocean_list: {
    type: [OceanSchema],
    default: DEFAULT_OCEAN_LIST,
  },
  cleared_quests: {
    type: [ClearedQuests],
    default: [],
  },
  nyanken_cooldown: {
    mst_nyanken_id: { type: Number, default: 0 },
    last_draw_time: { type: Number, default: 0 },
  },
  equipment_id_counter: { type: Number, default: 0 },
  guild_info: {
    gid: { type: String, default: '' },
    is_guild: { type: Number, default: 0 },
    is_same: { type: Number, default: 0 },
    member_type: { type: Number, default: 0 },
    name: { type: String, default: '' },
    rank: { type: Number, default: 0 },
    login_freq: { type: Number, default: 0 },
    chat_freq: { type: Number, default: 0 },
    yarikomi: { type: Number, default: 0 },
    mood: { type: Number, default: 0 },
    timezone: { type: Number, default: 0 },
    waited: { type: Number, default: 0 },
    receive: {
      type: [
        {
          _id: { type: String, required: true },
          created: { type: Number, default: 0 },
          gid: { type: String, required: true },
          uid: { type: String, required: true },
        },
      ],
      default: [],
    },
    send: {
      type: [
        {
          _id: { type: String, required: true },
          created: { type: Number, default: 0 },
          gid: { type: String, required: true },
          uid: { type: String, required: true },
        },
      ],
      default: [],
    },
  },
});

const User = model<IUser>('User', userSchema);
export default User;
