import mongoose from "mongoose";

const upvoteSchema = new mongoose.Schema(
  {
    promptId: { type: mongoose.Schema.Types.ObjectId, ref: "Prompt", required: true },
    uid: { type: String, required: true },
  },
  { timestamps: true }
);

upvoteSchema.index({ promptId: 1, uid: 1 }, { unique: true });
upvoteSchema.index({ uid: 1 });

export const Upvote = mongoose.model("Upvote", upvoteSchema);
