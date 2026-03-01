import mongoose from "mongoose";

const prCommentSchema = new mongoose.Schema(
  {
    authorUid: { type: String, required: true },
    authorUsername: { type: String, required: true },
    body: { type: String, required: true },
  },
  { timestamps: true, _id: true }
);

const pullRequestSchema = new mongoose.Schema(
  {
    promptId: { type: mongoose.Schema.Types.ObjectId, ref: "Prompt", required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    authorUid: { type: String, required: true, index: true },
    authorUsername: { type: String, required: true },
    status: { type: String, enum: ["open", "closed", "merged"], default: "open", index: true },
    promptDiff: { type: String, default: null },
    baseBranch: { type: String, default: "main" },
    headBranch: { type: String, default: "main" },
    proposedPrimaryPrompt: { type: String, default: null },
    proposedGuide: { type: String, default: null },
    proposedTags: [{ type: String }],
    comments: [prCommentSchema],
  },
  { timestamps: true }
);

pullRequestSchema.index({ promptId: 1, status: 1, createdAt: -1 });

export const PullRequest = mongoose.model("PullRequest", pullRequestSchema);
