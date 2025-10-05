import mongoose from "mongoose";
const { Schema } = mongoose;

const augiteSchema = new Schema({
  amount: Number,
  mst_augite_id: Number,
  mst_monument_type_id: Number,
});

export default augiteSchema;