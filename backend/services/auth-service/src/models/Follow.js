import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    followerUid: { type: String, required: true, index: true },
    followeeUid: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

followSchema.index({ followerUid: 1, followeeUid: 1 }, { unique: true });
followSchema.index({ followeeUid: 1, createdAt: -1 });
followSchema.index({ followerUid: 1, createdAt: -1 });

export const Follow = mongoose.model("Follow", followSchema);
