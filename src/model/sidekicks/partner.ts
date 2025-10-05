import mongoose from "mongoose";
const { Schema } = mongoose;

const partnerSchema = new Schema({
  created: Number,
  exp: Number,
  exp_max: Number,
  level: Number,
  level_cap_tier: Number,
  level_max: Number,
  mst_partner_id: Number,
  partner_id: String,
});

export default partnerSchema;