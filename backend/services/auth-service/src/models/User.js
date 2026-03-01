import mongoose from "mongoose";

const loginRecordSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    username: { type: String, default: null }, // unique handle for profile URL and @mentions
    displayName: { type: String, default: null },
    photoURL: { type: String, default: null },
    bio: { type: String, default: null },
    website: { type: String, default: null },
    emailVerified: { type: Boolean, default: false },
    provider: { type: String, default: "google" },
    lastLoginAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Unique index for upsert by uid
loginRecordSchema.index({ uid: 1 }, { unique: true });
// One account per email
loginRecordSchema.index({ email: 1 }, { unique: true });
// Username unique, sparse (allow null)
loginRecordSchema.index({ username: 1 }, { unique: true, sparse: true });

export const User = mongoose.model("User", loginRecordSchema);
