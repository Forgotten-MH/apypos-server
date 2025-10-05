import mongoose from "mongoose";
const { Schema } = mongoose;

const growthItemSchema = new Schema({
    amount: Number,
    mst_growth_item_id: Number,
  });



export default growthItemSchema;