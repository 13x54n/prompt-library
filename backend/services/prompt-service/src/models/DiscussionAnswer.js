import mongoose from "mongoose";

const discussionAnswerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "DiscussionQuestion", required: true, index: true },
    content: { type: String, required: true },
    authorUid: { type: String, required: true, index: true },
    authorUsername: { type: String, required: true },
    votes: { type: Number, default: 0 },
    accepted: { type: Boolean, default: false },
    voteUids: [{ type: String }],
  },
  { timestamps: true }
);

discussionAnswerSchema.index({ questionId: 1, createdAt: 1 });

export const DiscussionAnswer = mongoose.model("DiscussionAnswer", discussionAnswerSchema);
