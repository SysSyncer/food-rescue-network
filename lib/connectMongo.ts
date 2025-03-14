import mongoose from "mongoose";

const MONGO_URI =
  process.env.MONGO_URI! || "mongodb://localhost:27017/food-rescue-network";

if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable");
}

export default async function connectMongo() {
  if (mongoose.connection.readyState === 1) {
    console.log("MongoDB is already connected");
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
