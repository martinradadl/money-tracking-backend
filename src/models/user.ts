import mongoose from "mongoose";

export interface UserI extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  currency: { name: string; code: string };
  timezone: string,
}

const schema = new mongoose.Schema<UserI>({
  name: String,
  email: { type: String, unique: true },
  password: String,
  currency: { name: String, code: String },
  timezone: String,
});

export const User = mongoose.model<UserI>("User", schema);
