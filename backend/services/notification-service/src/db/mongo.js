import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/prompt-library";

export async function connectMongo() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("[notification-service] Connected to MongoDB");
  } catch (err) {
    console.error("[notification-service] MongoDB connection error:", err.message);
    throw err;
  }
}
