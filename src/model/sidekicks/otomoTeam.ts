import mongoose from "mongoose";
const { Schema } = mongoose;

const otomoTeamSchema = new Schema({
  index:  Number,
  otomo_ids:  [String],
},);

export default otomoTeamSchema;
