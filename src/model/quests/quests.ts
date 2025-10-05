import mongoose from "mongoose";

const QuestSchema = new mongoose.Schema({
  mst_node_id: Number, // Link quests to a node
  mst_quest_id: Number,
  is_collection_quest: Number,
  is_key_quest: Number,
  quest_subtargets: [{ mst_subtarget_id: Number, state: Number }],
  time_of_day: String, // "day" or "night"
});

export default mongoose.model("Quest", QuestSchema);

