import mongoose from "mongoose";
const { Schema, model } = mongoose;
const QUEST_STATE = { //0 =? 1 = New 2= ? 3= Clear (S A B C based on clear_time)
  UNKNOWN:0,  //possible non value
  NEW: 1,
  UNKNOWN3:2,
  CLEAR: 3, 
};

const NODE_STATE = { // State of node //0 = ?? 1 = ?? 2 = new! 3 = Medal and Silver Crown 4 = Medal and Gold Crown 5 = Bubble ... 6 = Help! 7 = Bubble with !  8= Bubble dancing around with music shape 9= Now to the next island sign
  UNKNOWN_0: 0,  //possible non value
  UNKNOWN_1: 1,
  NEW: 2, //Only just unlocked
  MEDAL_SILVER_CROWN: 3, // All quests completed on Node (Day and Night)
  MEDAL_GOLD_CROWN: 4, // All quests completed on Node (Day and Night) as S Rank (Clear within 1:30)
  BUBBLE: 5, 
  HELP: 6,  //1. Hunter needs to interact with this node to trigger the request to be taken
  BUBBLE_EXCLAMATION: 7, //2. Current requests target monster in this location
  BUBBLE_MUSIC: 8, //3. Report back to node to finish request
  NEXT_ISLAND: 9,
};

const ARTIFACT_STATE = { // Artifact State 0/1 = ? 2 = Newly Discoverd (will do a big opening) 3 = Discoverd
  UNKNOWN_0: 0, //possible non value
  UNKNOWN_1: 1,
  NEWLY_DISCOVERED: 2, // Triggers big opening
  DISCOVERED: 3,
};

const PART_STATE = { // Part state (1 = Open, 0 = Closed 2 ==? 3== gingira_node like Sparkle over island)
  CLOSED: 0,
  OPEN: 1,
  UNKNOWN_2: 2,
  GINGIRA_SPARKLE: 3, // When `gingira_node_id` is set
};

const QuestSubtargetSchema = new Schema({
  mst_subtarget_id: Number, //What Subtarget is cleared this needs to be matched with internals 
  state: Number, //0 Non Cleared //1 Cleared
});

const QuestSchema = new Schema({
  clear_time: Number, // Time taken to clear quest
  is_collection_quest: Number,
  is_key_quest: Number,
  mst_quest_id: Number,
  quest_subtargets: [QuestSubtargetSchema],
  state: { type: Number, enum: Object.values(QUEST_STATE) }, //0 =? 1 = New 2= ? 3= Clear (S A B C based on clear_time)
});

const NodeSchema = new Schema({ //TODO remove day/night quests and collection replace with a databse lookup in places it is needed against a completed quests database
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
   mst_object_id: Number,// object number 2 is the bridge
  state: Number //1 hidden 2 active 
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

export default OceanSchema