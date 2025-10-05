import mongoose from "mongoose";
import { getDurationFromValue } from "./utils";

const TicketEventSchema = new mongoose.Schema(
  {
    banner_id: { type: Number, required: true },
    buy_end_str: { type: String, default: "" },
    buy_end_remain: {
      type: Date,
      get: getDurationFromValue,
    },
    buy_start_remain: {
      type: Date,
      get: getDurationFromValue,
    },
    clear_time: { type: Number, default: 0 },
    end_str: { type: String, default: "" },
    end_remain: {
      type: Date,
      get: getDurationFromValue,
    },
    is_push: { type: Number, default: 0 }, //Recommend Flag Bool
    limited_amount: { type: Number, default: 0 },
    mst_limited_id: { type: Number, required: true },
    mst_quest_id: { type: Number, required: true },
    quest_subtargets: { type: [Object], default: [] },
    start_remain: {
      type: Date,
      get: getDurationFromValue,
    },
    state: { type: Number, default: 0 },
  },
  { toJSON: { getters: true }, toObject: { getters: true } }
);

const TicketEvents = mongoose.model("TicketEvents", TicketEventSchema);
export default TicketEvents;