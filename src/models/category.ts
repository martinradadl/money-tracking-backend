import mongoose from "mongoose";

const schema = new mongoose.Schema({
  value: String,
});

export const Category = mongoose.model("Category", schema);
