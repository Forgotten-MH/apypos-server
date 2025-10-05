import mongoose from "mongoose";
import { getDurationFromValue } from "./utils";
const M16EventSchema = new mongoose.Schema(
  {
    appear_remain: {
      type: Date,
      get: getDurationFromValue,
    },
    big_node_banner_id: { type: Number, required: true },
    disappear_remain: {
      type: Date,
      get: getDurationFromValue,
    },
    end_remain: {
      type: Date,
      get: getDurationFromValue,
    },
    metamorphoze_type: { type: Number, default: 0 },
    middle_node_banner_id: { type: Number, required: true },
    mst_event_node_id: { type: Number, required: true },
    recommended_flag: { type: Number, default: 0 },
    state: { type: Number, default: 0 },
    start_remain: {
      type: Date,
      get: getDurationFromValue,
    },
  },
  { toJSON: { getters: true }, toObject: { getters: true } }
);


const M16Events = mongoose.model("M16Events", M16EventSchema);
export default M16Events;