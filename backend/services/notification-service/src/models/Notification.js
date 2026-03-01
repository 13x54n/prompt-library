import mongoose from "mongoose";

export const NOTIFICATION_TYPES = [
  "prompt_forked",
  "prompt_upvoted",
  "discussion_answered",
  "discussion_replied",
  "discussion_question_on_my_prompt",
  "pr_created",
  "pr_commented",
  "pr_merged",
  "user_followed",
];

const notificationSchema = new mongoose.Schema(
  {
    recipientUid: { type: String, required: true, index: true },
    type: { type: String, required: true, enum: NOTIFICATION_TYPES, index: true },
    actorUid: { type: String, default: null },
    actorUsername: { type: String, default: null },
    entityType: {
      type: String,
      required: true,
      enum: ["prompt", "discussion_question", "discussion_answer", "pull_request", "user"],
    },
    entityId: { type: String, required: true },
    promptId: { type: String, default: null, index: true },
    title: { type: String, required: true },
    body: { type: String, default: null },
    link: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
    archived: { type: Boolean, default: false, index: true },
    archivedAt: { type: Date, default: null },
    eventId: { type: String, required: true, unique: true, index: true },
    eventType: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientUid: 1, createdAt: -1 });
notificationSchema.index({ recipientUid: 1, archived: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);
