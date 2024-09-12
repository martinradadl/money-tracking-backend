import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  token: String,
});

export const User = mongoose.model("User", schema);
