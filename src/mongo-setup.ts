import mongoose from "mongoose";

const uri =
  "mongodb+srv://martinrdl:martin01@cluster0.4t9qdhe.mongodb.net/money-tracking?retryWrites=true&w=majority&appName=Cluster0";

export async function initMongo() {
  try {
    await mongoose.connect(uri);
  } finally {
    console.log("mongosetup complete")
  }
}

export const ObjectId = mongoose.Types.ObjectId;