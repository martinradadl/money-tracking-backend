import mongoose from "mongoose";

const schema = new mongoose.Schema({
  label: String,
});

export const Category = mongoose.model("Category", schema);
