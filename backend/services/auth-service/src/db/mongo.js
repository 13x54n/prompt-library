import mongoose from "mongoose";

const DEFAULT_URI = "mongodb://localhost:27017/prompt-library";

export async function connectMongo() {
  const uri = process.env.MONGODB_URI ?? DEFAULT_URI;
  try {
    await mongoose.connect(uri);
    console.log("[auth-service] Connected to MongoDB");
  } catch (err) {
    console.error("[auth-service] MongoDB connection error:", err.message);
    throw err;
  }
}
