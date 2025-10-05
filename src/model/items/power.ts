import mongoose from "mongoose";
const { Schema } = mongoose;

const powerSchema = new Schema({
  amount: Number,
  mst_power_id: Number,
});

export default powerSchema;