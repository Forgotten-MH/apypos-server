import mongoose from 'mongoose';
import { NODE_STATE, ARTIFACT_STATE, PART_STATE } from '../constants/ocean.js';
const { Schema } = mongoose;

const _QuestSubtargetSchema = new Schema({
  mst_subtarget_id: Number, //What Subtarget is cleared this needs to be matched with internals
  state: Number, //0 Non Cleared //1 Cleared
});

const NodeSchema = new Schema({
  //TODO remove day/night quests and collection replace with a databse lookup in places it is needed against a completed quests database
  is_collection_node: Number, // Discovery flag / if set to 1 adds ? Discovery (Collect Item from node??)
  mst_node_id: Number,
  mst_story_id: Number,
  state: { type: Number, enum: Object.values(NODE_STATE) },
});

const RaidInfoSchema = new Schema({
  end_remain: Number,
  mst_node_id: Number,
  start_remain: Number,
});
const CampaignSchema = new Schema({
  mst_campaign_id: Number,
  remain_time: Number,
});

const NoteContentSchema = new Schema({
  mst_note_content_id: Number,
  state: { type: Number, enum: Object.values(ARTIFACT_STATE) },
});

const ExplorationNoteSchema = new Schema({
  note_contents: [NoteContentSchema],
  progress: Number,
});

const ObjectSchema = new Schema({
  mst_object_id: Number, // object number 2 is the bridge
  state: Number, //1 hidden 2 active
});

const PartSchema = new Schema({
  campaign: [CampaignSchema],
  exploration_note: ExplorationNoteSchema,
  gingira_node_id: Number, //unk value here if you put node id in here is sparkles
  mst_part_id: Number,
  node_list: [NodeSchema],
  object_list: [ObjectSchema],
  raid_info: [RaidInfoSchema], // Will put Monster sign above node and put "An intruding monster appears 59 mins"
  silver_bonus: Number,
  state: { type: Number, enum: Object.values(PART_STATE) },
});
const OceanSchema = new Schema({
  mst_ocean_id: Number,
  part_list: [PartSchema],
});

export default OceanSchema;
