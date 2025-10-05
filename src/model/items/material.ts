import mongoose from "mongoose";
const { Schema } = mongoose;

const materialSchema = new Schema({
  amount: Number,
  mst_material_id: Number,
});

export default materialSchema;