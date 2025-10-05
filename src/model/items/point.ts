import mongoose from "mongoose";
const { Schema } = mongoose;

const pointSchema = new Schema({
  amount: Number,
  mst_event_point_id: Number,
});

export default pointSchema;