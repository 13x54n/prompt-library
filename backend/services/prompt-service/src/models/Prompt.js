import mongoose from "mongoose";

const parameterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    placeholder: { type: String, default: null },
    type: { type: String, enum: ["text", "select"], default: "text" },
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    votes: { type: Number, default: 0 },
    accepted: { type: Boolean, default: false },
  },
  { _id: false }
);

const promptSchema = new mongoose.Schema(
  {
    authorUid: { type: String, required: true, index: true },
    authorUsername: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    tags: [{ type: String }],
    primaryPrompt: { type: String, required: true },
    guide: { type: String, default: null },
    visibility: { type: String, enum: ["public", "unlisted"], default: "public", index: true },
    parameters: [parameterSchema],
    variants: [variantSchema],
    stats: {
      upvotes: { type: Number, default: 0 },
      forks: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
      interactions: { type: Number, default: 0 },
    },
    isPinned: { type: Boolean, default: false, index: true },
    parentPromptId: { type: mongoose.Schema.Types.ObjectId, ref: "Prompt", default: null, index: true },
  },
  { timestamps: true }
);

// Indexes for common queries
promptSchema.index({ authorUid: 1, createdAt: -1 });
promptSchema.index({ authorUsername: 1, createdAt: -1 });
promptSchema.index({ tags: 1 });
promptSchema.index({ createdAt: -1 });
promptSchema.index({ "stats.upvotes": -1 });

export const Prompt = mongoose.model("Prompt", promptSchema);
