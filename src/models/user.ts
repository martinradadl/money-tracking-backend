import mongoose from "mongoose";

export interface UserI extends mongoose.Document {
  name: string;
  email: string;
  password: string;
}

const schema = new mongoose.Schema<UserI>({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

export const User = mongoose.model<UserI>("User", schema);
