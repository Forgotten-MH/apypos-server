import mongoose from "mongoose";
import { getDurationFromValue } from "./utils";
const ScoreEventSchema = new mongoose.Schema(
  {
    big_node_banner_id: { type: Number, required: true },
    end_remain: {
      type: Date,
      get: getDurationFromValue,
    },
    middle_node_banner_id: { type: Number, required: true },
    mst_score_node_id: { type: Number, required: true },
    schedule_category: { type: String, default: "" },
    start_remain: {
      type: Date,
      get: getDurationFromValue,
    },
    recommended_flag: { type: Number, default: 0 },
    state: { type: Number, default: 0 },
  },
  { toJSON: { getters: true }, toObject: { getters: true } }
);



const ScoreEvents = mongoose.model("ScoreEvents", ScoreEventSchema);
export default ScoreEvents;