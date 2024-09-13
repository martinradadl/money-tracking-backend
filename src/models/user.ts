import mongoose from "mongoose";

export interface UserI extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  token: string;
}

const schema = new mongoose.Schema<UserI>({
  name: String,
  email: { type: String, unique: true },
  password: String,
  token: String,
});

export const User = mongoose.model<UserI>("User", schema);
