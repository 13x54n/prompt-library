import mongoose from "mongoose";

const discussionQuestionSchema = new mongoose.Schema(
  {
    promptId: { type: mongoose.Schema.Types.ObjectId, ref: "Prompt", required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    authorUid: { type: String, required: true, index: true },
    authorUsername: { type: String, required: true },
    votes: { type: Number, default: 0 },
    acceptedAnswerId: { type: mongoose.Schema.Types.ObjectId, default: null },
    voteUids: [{ type: String }],
  },
  { timestamps: true }
);

discussionQuestionSchema.index({ promptId: 1, createdAt: -1 });

export const DiscussionQuestion = mongoose.model("DiscussionQuestion", discussionQuestionSchema);
