import mongoose from "mongoose";

const schema = new mongoose.Schema({
  type: String,
  entity: String,
  concept: String,
  amount: Number,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export const Debt = mongoose.model("Debt", schema);
