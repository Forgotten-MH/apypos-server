import mongoose from "mongoose";
import { getDurationFromValue } from "./utils";
const AssaultEventSchema =  new mongoose.Schema(
  {
    appear_remain: {
      type: Date,
      get: getDurationFromValue,
    },
    disappear_remain: {
      type: Date,
      get: getDurationFromValue,
    },
    end_remain: {
      type: Date,
      get: getDurationFromValue,
    },
    start_remain: {
      type: Date,
      get: getDurationFromValue,
    },
    is_user_cleartime_ranking: { type: Number, default: 0 },
    big_node_banner_id: { type: Number, required: true },
    middle_node_banner_id: { type: Number, required: true },
    mst_event_node_id: { type: Number, required: true },
    recommended_flag: { type: Number, default: 0 },
    schedule_category: { type: String, default: "" },
    schedule_type: { type: Number, default: 1 },
    state: { type: Number, required: true },
  },
  { toJSON: { getters: true }, toObject: { getters: true } }
);



const AssualtEvents = mongoose.model("AssualtEvents", AssaultEventSchema);
export default AssualtEvents;

