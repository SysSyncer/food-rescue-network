import mongoose from "mongoose";

const MONGO_URI =  process.env.MONGO_URI || "mongodb://localhost:27017/playground1";

if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable");
}

let isConnected = false; // Track the connection state

export default async function connectMongo() {
  if (isConnected) {
    console.log("MongoDB is already connected");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI!);
    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}