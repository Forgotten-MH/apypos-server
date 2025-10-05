import mongoose from "mongoose";
const { Schema } = mongoose;

const paymentSchema = new Schema({
  amount: Number,
  mst_payment_id: Number,
});

export default paymentSchema;