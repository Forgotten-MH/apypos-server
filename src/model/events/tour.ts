


import mongoose from "mongoose";
import { getDurationFromValue } from "./utils";

const TourEventSchema = new mongoose.Schema(
  {
    big_node_banner_id: { type: Number, required: true },
    end_remain: {
      type: Date,
      get: getDurationFromValue,
    },
    middle_node_banner_id: { type: Number, required: true },
    mst_event_node_id: { type: Number, required: true },
    schedule_category: { type: String, default: "" },
    start_remain: {
      type: Date,
      get: getDurationFromValue,
    },
    state: { type: Number, default: 0 },
  },
  { toJSON: { getters: true }, toObject: { getters: true } }
);
const TourEvents = mongoose.model("TourEvents", TourEventSchema);
export default TourEvents;