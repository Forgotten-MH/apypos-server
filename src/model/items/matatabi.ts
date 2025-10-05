import mongoose from "mongoose";
const { Schema } = mongoose;

const matatabiSchema = new Schema({
  amount: Number,
  mst_matatabi_id: Number,
});



export default matatabiSchema;