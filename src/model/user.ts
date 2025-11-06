import mongoose from "mongoose";
import OceanSchema from "./ocean";
import equipmentSchema from "./items/equipment";
import growthItemSchema from "./items/growth_item";
import limitedSchema from "./items/limited";
import matatabiSchema from "./items/matatabi";
import materialSchema from "./items/material";
import paymentSchema from "./items/payment";
import pointSchema from "./items/point";
import powerSchema from "./items/power";
import augiteSchema from "./items/augite";
import otomoSchema from "./sidekicks/otomo";
import partnerSchema from "./sidekicks/partner";
import otomoTeamSchema from "./sidekicks/otomoTeam";
const { Schema, model } = mongoose;
const equipPieceSchema = new Schema({
  created: Number,
  equipment_id: { type: String, default: "NO_EQUIP" },
  level: Number,
  mst_equipment_id: Number,
  potential: Number,
  skill_level: Number,
});

const equipSetPieceSchema = new Schema({
  equipment_id: { type: String, default: "NO_EQUIP" },
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

const SocialEquipPartSchema = new Schema({
  equipment_id: { type: String, required: true },
  mst_equipment_id: { type: Number, required: true }
}, { _id: false });

// Define the full SocialEquipset schema
const SocialEquipsetSchema = new Schema({
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
  mst_partner_id: { type: Number, required: true }
}, { _id: false });

const userSchema = new Schema({
  uu_id: String,
  secret_id: String,
  login_id: String,
  mst_himitsu_question_id: String, //transfer related (TODO move to transfer.mst_himitsu_question_id)
  himitsu_answer: String, //transfer related (TODO move to transfer.himitsu_answer)
  migration_pass: String, //transfer related (TODO move to transfer.migration_pass)
  migration_id: String, //transfer related (TODO move to transfer.migration_id)
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
      default: [
        {
          auto_potential_composite: 0,
          awaked: 0,
          created: 0,
          elv: 0,
          endAwakeCount: 0,
          endAwakeRemain: 0,
          end_remain: 0,
          equipment_id: "AD_ARM006",
          evolve_start_time: 0,
          favorite: 0,
          is_awake: 0,
          is_complete_auto_potential_composite: 0,
          mst_equipment_id: 3325982510,
          potential: 0,
          slv: 0,
          start_remain: 0,
        },
        {
          auto_potential_composite: 0,
          awaked: 0,
          created: 0,
          elv: 0,
          endAwakeCount: 0,
          endAwakeRemain: 0,
          end_remain: 0,
          equipment_id: "AD_BODY006",
          evolve_start_time: 0,
          favorite: 0,
          is_awake: 0,
          is_complete_auto_potential_composite: 0,
          mst_equipment_id: 1801022340,
          potential: 0,
          slv: 0,
          start_remain: 0,
        },
        {
          auto_potential_composite: 0,
          awaked: 0,
          created: 0,
          elv: 0,
          endAwakeCount: 0,
          endAwakeRemain: 0,
          end_remain: 0,
          equipment_id: "AD_LEG006",
          evolve_start_time: 0,
          favorite: 0,
          is_awake: 0,
          is_complete_auto_potential_composite: 0,
          mst_equipment_id: 3353202438,
          potential: 0,
          slv: 0,
          start_remain: 0,
        },
        {
          auto_potential_composite: 0,
          awaked: 0,
          created: 0,
          elv: 0,
          endAwakeCount: 0,
          endAwakeRemain: 0,
          end_remain: 0,
          equipment_id: "AD_HEAD006",
          evolve_start_time: 0,
          favorite: 0,
          is_awake: 0,
          is_complete_auto_potential_composite: 0,
          mst_equipment_id: 69277598,
          potential: 0,
          slv: 0,
          start_remain: 0,
        },
        {
          auto_potential_composite: 0,
          awaked: 0,
          created: 0,
          elv: 0,
          endAwakeCount: 0,
          endAwakeRemain: 0,
          end_remain: 0,
          equipment_id: "WD_SWORD001",
          evolve_start_time: 0,
          favorite: 0,
          is_awake: 0,
          is_complete_auto_potential_composite: 0,
          mst_equipment_id: 2006810019,
          potential: 0,
          slv: 0,
          start_remain: 0,
        },
        {
          auto_potential_composite: 0,
          awaked: 0,
          created: 0,
          elv: 0,
          endAwakeCount: 0,
          endAwakeRemain: 0,
          end_remain: 0,
          equipment_id: "AD_WST006",
          evolve_start_time: 0,
          favorite: 0,
          is_awake: 0,
          is_complete_auto_potential_composite: 0,
          mst_equipment_id: 62957325,
          potential: 0,
          slv: 0,
          start_remain: 0,
        },
        {
          ///For Partner ... remove once story introduces them properly...
          auto_potential_composite: 0,
          awaked: 0,
          created: 0,
          elv: 0,
          endAwakeCount: 0,
          endAwakeRemain: 0,
          end_remain: 0,
          equipment_id: "WD_LBOWGUN001",
          evolve_start_time: 0,
          favorite: 0,
          is_awake: 0,
          is_complete_auto_potential_composite: 0,
          mst_equipment_id: 3125656021,
          potential: 0,
          slv: 0,
          start_remain: 0,
        },
        {
          
          auto_potential_composite: 0,
          awaked: 0,
          created: 0,
          elv: 0,
          endAwakeCount: 0,
          endAwakeRemain: 0,
          end_remain: 0,
          equipment_id: "OD_OMA1387",
          evolve_start_time: 0,
          favorite: 0,
          is_awake: 0,
          is_complete_auto_potential_composite: 0,
          mst_equipment_id: 3529887655,
          potential: 0,
          slv: 0,
          start_remain: 0,
        },{
          
          auto_potential_composite: 0,
          awaked: 0,
          created: 0,
          elv: 0,
          endAwakeCount: 0,
          endAwakeRemain: 0,
          end_remain: 0,
          equipment_id: "OD_OMA1388",
          evolve_start_time: 0,
          favorite: 0,
          is_awake: 0,
          is_complete_auto_potential_composite: 0,
          mst_equipment_id: 1121636918,
          potential: 0,
          slv: 0,
          start_remain: 0,
        },
        {
          
          auto_potential_composite: 0,
          awaked: 0,
          created: 0,
          elv: 0,
          endAwakeCount: 0,
          endAwakeRemain: 0,
          end_remain: 0,
          equipment_id: "OD_OMA1389",
          evolve_start_time: 0,
          favorite: 0,
          is_awake: 0,
          is_complete_auto_potential_composite: 0,
          mst_equipment_id: 903733920,
          potential: 0,
          slv: 0,
          start_remain: 0,
        },{
          
          auto_potential_composite: 0,
          awaked: 0,
          created: 0,
          elv: 0,
          endAwakeCount: 0,
          endAwakeRemain: 0,
          end_remain: 0,
          equipment_id: "OD_OMA1390",
          evolve_start_time: 0,
          favorite: 0,
          is_awake: 0,
          is_complete_auto_potential_composite: 0,
          mst_equipment_id: 1427794757,
          potential: 0,
          slv: 0,
          start_remain: 0,
        },{
          
          auto_potential_composite: 0,
          awaked: 0,
          created: 0,
          elv: 0,
          endAwakeCount: 0,
          endAwakeRemain: 0,
          end_remain: 0,
          equipment_id: "OD_OMA1391",
          evolve_start_time: 0,
          favorite: 0,
          is_awake: 0,
          is_complete_auto_potential_composite: 0,
          mst_equipment_id: 572349395,
          potential: 0,
          slv: 0,
          start_remain: 0,
        },{
          
          auto_potential_composite: 0,
          awaked: 0,
          created: 0,
          elv: 0,
          endAwakeCount: 0,
          endAwakeRemain: 0,
          end_remain: 0,
          equipment_id: "OD_OMA1392",
          evolve_start_time: 0,
          favorite: 0,
          is_awake: 0,
          is_complete_auto_potential_composite: 0,
          mst_equipment_id: 3138652777,
          potential: 0,
          slv: 0,
          start_remain: 0,
        },
        {
          
          auto_potential_composite: 0,
          awaked: 0,
          created: 0,
          elv: 0,
          endAwakeCount: 0,
          endAwakeRemain: 0,
          end_remain: 0,
          equipment_id: "OD_OMA1393",
          evolve_start_time: 0,
          favorite: 0,
          is_awake: 0,
          is_complete_auto_potential_composite: 0,
          mst_equipment_id: 3423812351,
          potential: 0,
          slv: 0,
          start_remain: 0,
        },
        {
          
          auto_potential_composite: 0,
          awaked: 0,
          created: 0,
          elv: 0,
          endAwakeCount: 0,
          endAwakeRemain: 0,
          end_remain: 0,
          equipment_id: "OD_OMA1394",
          evolve_start_time: 0,
          favorite: 0,
          is_awake: 0,
          is_complete_auto_potential_composite: 0,
          mst_equipment_id: 1383575388,
          potential: 0,
          slv: 0,
          start_remain: 0,
        }, {
          
          auto_potential_composite: 0,
          awaked: 0,
          created: 0,
          elv: 0,
          endAwakeCount: 0,
          endAwakeRemain: 0,
          end_remain: 0,
          equipment_id: "OD_OMA1395",
          evolve_start_time: 0,
          favorite: 0,
          is_awake: 0,
          is_complete_auto_potential_composite: 0,
          mst_equipment_id: 628137930,
          potential: 0,
          slv: 0,
          start_remain: 0,
        },{
          
          auto_potential_composite: 0,
          awaked: 0,
          created: 0,
          elv: 0,
          endAwakeCount: 0,
          endAwakeRemain: 0,
          end_remain: 0,
          equipment_id: "OD_OMA1396",
          evolve_start_time: 0,
          favorite: 0,
          is_awake: 0,
          is_complete_auto_potential_composite: 0,
          mst_equipment_id: 3162099312,
          potential: 0,
          slv: 0,
          start_remain: 0,
        },
      ],
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
      default: [
        {
          created: 2,
          exp: 1,
          mst_otomo_id: 498951865,
          otomo_id: "OT_OTOMO_CHAR_ID_118",
          subskill: [],
          attack: 1,
          defense: 1,
          hp: 1,
          level: 1,
        },
        {
          created: 2,
          exp: 1,
          mst_otomo_id: 1790596655,
          otomo_id: "OT_OTOMO_CHAR_ID_119",
          subskill: [],
          attack: 1,
          defense: 1,
          hp: 1,
          level: 1,
        },
      ],
    },
    partners: {
      type: [partnerSchema],
      //Remove once story that introduces them properly
      default: [
        {
          created: 0,
          exp: 0,
          exp_max: 0,
          level: 0,
          level_cap_tier: 0,
          level_max: 1,
          mst_partner_id: 507850012,
          partner_id: "PT_CHAR_ID_001",
        },
        {
          created: 0,
          exp: 0,
          exp_max: 0,
          level: 0,
          level_cap_tier: 0,
          level_max: 1,
          mst_partner_id: 2269936806,
          partner_id: "PT_CHAR_ID_002",
        },
        {
          created: 0,
          exp: 0,
          exp_max: 0,
          level: 0,
          level_cap_tier: 0,
          level_max: 1,
          mst_partner_id: 4031466544,
          partner_id: "PT_CHAR_ID_003",
        },
        {
          created: 0,
          exp: 0,
          exp_max: 0,
          level: 0,
          level_cap_tier: 0,
          level_max: 1,
          mst_partner_id: 1848629651,
          partner_id: "PT_CHAR_ID_004",
        },
        {
          created: 0,
          exp: 0,
          exp_max: 0,
          level: 0,
          level_cap_tier: 0,
          level_max: 1,
          mst_partner_id: 422111493,
          partner_id: "PT_CHAR_ID_005",
        },
      ],
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
      default: {
        index: 1,
        partner_equip_sets: [
          {
            mst_partner_id: 507850012,
            arm: {
              equipment_id: "NO_EQUIP",
            },
            body: {
              equipment_id: "NO_EQUIP",
            },
            leg: {
              equipment_id: "NO_EQUIP",
            },
            head: {
              equipment_id: "NO_EQUIP",
            },
            secret_weapon: {
              equipment_id: "NO_EQUIP",
            },
            talisman: {
              equipment_id: "NO_EQUIP",
            },
            waist: {
              equipment_id: "NO_EQUIP",
            },
            weapon: {
              equipment_id: "WD_LBOWGUN001",
            },
          },
        ],
        arm: {
          equipment_id: "AD_ARM006",
        },
        body: {
          equipment_id: "AD_BODY006",
        },
        leg: {
          equipment_id: "AD_LEG006",
        },
        head: {
          equipment_id: "AD_HEAD006",
        },
        secret_weapon: {
          equipment_id: "NO_EQUIP",
        },
        talisman: {
          equipment_id: "NO_EQUIP",
        },
        waist: {
          equipment_id: "AD_WST006",
        },
        weapon: {
          equipment_id: "WD_SWORD001",
        },
      },
    },
    selected_equip_set_index: { type: Number, default: 1 },
  },
  social_equip_sets: {
    type: [SocialEquipsetSchema],
    default: {
      gunner: {
        social_arm: {
          equipment_id: "NO_EQUIP",

          mst_equipment_id: -1,
        },
        social_body: {
          equipment_id: "NO_EQUIP",

          mst_equipment_id: -1,
        },
        social_head: {
          equipment_id: "NO_EQUIP",
          mst_equipment_id: -1,
        },
        social_leg: {
          equipment_id: "NO_EQUIP",
          mst_equipment_id: -1,
        },
        social_waist: {
          equipment_id: "NO_EQUIP",
          mst_equipment_id: -1,
        },
      },
      is_used: 0,
      knight: {
        social_arm: {
          equipment_id: "AD_ARM006",

          mst_equipment_id: -1,
        },
        social_body: {
          equipment_id: "AD_BODY006",

          mst_equipment_id: -1,
        },
        social_head: {
          equipment_id: "AD_HEAD006",

          mst_equipment_id: -1,
        },
        social_leg: {
          equipment_id: "AD_LEG006",

          mst_equipment_id: -1,
        },
        social_waist: {
          equipment_id: "AD_WST006",

          mst_equipment_id: -1,
        },
      },

      mst_partner_id: 0,
    },
  },
  otomoteam: {
    capacity: { type: Number, default: 1 },
    otomo_team: {
      type: [otomoTeamSchema],
      default: [
        {
          index: 1,
          otomo_ids: ["OT_OTOMO_CHAR_ID_118", "OT_OTOMO_CHAR_ID_119"],
        },
      ],
    },
    selected_index: { type: Number, default: 1 },
  },
  selected_partner: {
    main_partner_id: { type: String, default: "PT_CHAR_ID_001" },
    quest_partner_id: { type: String, default: "PT_CHAR_ID_001" },
  },
  ocean_list: {
    type: [OceanSchema],
    default: {
      mst_ocean_id: 3525753088,
      part_list: [
        {
          mst_part_id: 3815380063,
          campaign: [],
          exploration_note: {
            note_contents: [
              {
                mst_note_content_id: 2030304811,
                state: 1,
              },
              {
                mst_note_content_id: 3758796689,
                state: 1,
              },
              {
                mst_note_content_id: 2534252295,
                state: 1,
              },
              {
                mst_note_content_id: 157878948,
                state: 1,
              },
              {
                mst_note_content_id: 2121153074,
                state: 1,
              },
            ],
            progress: 0,
          },
          gingira_node_id: 3332266232,
          node_list: [
            {
              is_collection_node: 0,
              mst_node_id: 517825253,
              mst_story_id: 1603733826,
              state: 5,
            },
          ],
          object_list: [],
          raid_info: [],
          silver_bonus: 0,
          state: 1,
        },
      ],
    },
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
  gid: { type: String, default: "" },
  is_guild: { type: Number, default: 0 },
  is_same: { type: Number, default: 0 },
  member_type: { type: Number, default: 0 },
  name: { type: String, default: "" },
  rank: { type: Number, default: 0 },
  login_freq: { type: Number, default: 0 },
  chat_freq: { type: Number, default: 0 },
  yarikomi: { type: Number, default: 0 },
  mood: { type: Number, default: 0 },
  timezone: { type: Number, default: 0 },
  waited: { type: Number, default: 0 },
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
},
});

const User = model("User", userSchema);
export default User;