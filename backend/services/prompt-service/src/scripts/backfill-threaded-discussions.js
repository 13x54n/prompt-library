import mongoose from "mongoose";
import { connectMongo } from "../db/mongo.js";
import { DiscussionAnswer } from "../models/DiscussionAnswer.js";
import { PullRequest } from "../models/PullRequest.js";

async function backfillDiscussionAnswers() {
  const result = await DiscussionAnswer.updateMany(
    { parentAnswerId: { $exists: false } },
    { $set: { parentAnswerId: null } }
  );
  const depthResult = await DiscussionAnswer.updateMany(
    { depth: { $exists: false } },
    { $set: { depth: 0 } }
  );

  return {
    parentAnswerIdUpdated: result.modifiedCount ?? 0,
    depthUpdated: depthResult.modifiedCount ?? 0,
  };
}

async function backfillPullRequestComments() {
  const prs = await PullRequest.find({ "comments.0": { $exists: true } }).select("_id comments").lean();
  let updatedPullRequests = 0;
  let updatedComments = 0;

  for (const pr of prs) {
    let changed = false;
    const comments = (pr.comments ?? []).map((comment) => {
      let commentChanged = false;
      const next = { ...comment };
      if (next.parentId === undefined) {
        next.parentId = null;
        changed = true;
        commentChanged = true;
      }
      if (next.depth === undefined || next.depth === null) {
        next.depth = next.parentId ? 1 : 0;
        changed = true;
        commentChanged = true;
      }
      if (commentChanged) updatedComments += 1;
      return next;
    });

    if (!changed) continue;
    await PullRequest.updateOne({ _id: pr._id }, { $set: { comments } });
    updatedPullRequests += 1;
  }

  return { updatedPullRequests, updatedComments };
}

async function run() {
  await connectMongo();
  const [discussion, pr] = await Promise.all([
    backfillDiscussionAnswers(),
    backfillPullRequestComments(),
  ]);

  console.log("[backfill-threaded-discussions] complete");
  console.log(
    JSON.stringify(
      {
        discussionAnswers: discussion,
        pullRequestComments: pr,
      },
      null,
      2
    )
  );
  await mongoose.connection.close();
}

run().catch(async (err) => {
  console.error("[backfill-threaded-discussions] failed:", err);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
