import mongoose from "mongoose";

const schema = new mongoose.Schema({
  type: String,
  concept: String,
  amount: Number,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export const Transaction = mongoose.model("Transaction", schema);
