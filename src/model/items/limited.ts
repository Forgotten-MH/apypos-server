import mongoose from "mongoose";
const { Schema } = mongoose;

const limitedSchema = new Schema({
  amount: Number,
  mst_limited_id: Number,
});



export default limitedSchema;