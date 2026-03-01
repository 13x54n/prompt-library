import { Router } from "express";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { Prompt } from "../models/Prompt.js";
import { PullRequest } from "../models/PullRequest.js";
import { publishDomainEvent } from "../lib/event-publisher.js";

const router = Router({ mergeParams: true });

function formatRelative(date) {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function formatPr(doc, { viewerUid = null, promptOwnerUid = null } = {}) {
  const p = doc.toObject ? doc.toObject() : doc;
  const isOwner = !!viewerUid && !!promptOwnerUid && viewerUid === promptOwnerUid;
  const isAuthor = !!viewerUid && viewerUid === p.authorUid;
  const isOpen = (p.status ?? "open") === "open";
  return {
    id: p._id.toString(),
    title: p.title,
    body: p.body ?? "",
    author: p.authorUsername,
    authorUid: p.authorUid,
    status: p.status ?? "open",
    createdAt: formatRelative(p.createdAt),
    baseBranch: p.baseBranch ?? "main",
    headBranch: p.headBranch ?? "main",
    promptDiff: p.promptDiff ?? null,
    proposedPrimaryPrompt: p.proposedPrimaryPrompt ?? null,
    proposedGuide: p.proposedGuide ?? null,
    proposedTags: p.proposedTags ?? [],
    discussionCount: Array.isArray(p.comments) ? p.comments.length : 0,
    canMerge: isOwner && isOpen,
    canClose: (isOwner || isAuthor) && isOpen,
    comments: (p.comments ?? []).map((c) => ({
      id: c._id.toString(),
      author: c.authorUsername,
      authorUid: c.authorUid ?? null,
      body: c.body,
      createdAt: formatRelative(c.createdAt),
    })),
  };
}

/**
 * GET /api/prompts/:id/pull-requests
 * List pull requests for a prompt.
 */
router.get("/", optionalAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const prompt = await Prompt.findById(id);
    if (!prompt) {
      return res.status(404).json({ success: false, error: "Prompt not found" });
    }

    const viewerUid = req.uid ?? null;
    const prs = await PullRequest.find({ promptId: id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      pullRequests: prs.map((p) => ({
        id: p._id.toString(),
        title: p.title,
        author: p.authorUsername,
        authorUid: p.authorUid ?? null,
        status: p.status ?? "open",
        createdAt: formatRelative(p.createdAt),
        discussionCount: Array.isArray(p.comments) ? p.comments.length : 0,
        canMerge:
          !!viewerUid &&
          viewerUid === prompt.authorUid &&
          (p.status ?? "open") === "open",
        canClose:
          !!viewerUid &&
          (viewerUid === prompt.authorUid || viewerUid === p.authorUid) &&
          (p.status ?? "open") === "open",
      })),
    });
  } catch (err) {
    console.error("[prompt-service] GET pull-requests error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to fetch pull requests" });
  }
});

/**
 * POST /api/prompts/:id/pull-requests
 * Create a new pull request. Requires auth.
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const uid = req.uid;
    const id = req.params.id;
    const {
      title,
      body,
      authorUsername,
      promptDiff,
      proposedPrimaryPrompt,
      proposedGuide,
      proposedTags,
    } = req.body;

    const prompt = await Prompt.findById(id);
    if (!prompt) {
      return res.status(404).json({ success: false, error: "Prompt not found" });
    }
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ success: false, error: "title is required" });
    }
    const username = (authorUsername ?? "").toString().trim().toLowerCase() || "unknown";

    const pr = await PullRequest.create({
      promptId: id,
      title: title.trim(),
      body: typeof body === "string" ? body.trim() : "",
      authorUid: uid,
      authorUsername: username,
      promptDiff: typeof promptDiff === "string" ? promptDiff.trim() : null,
      proposedPrimaryPrompt:
        typeof proposedPrimaryPrompt === "string" ? proposedPrimaryPrompt.trim() : null,
      proposedGuide: typeof proposedGuide === "string" ? proposedGuide.trim() : null,
      proposedTags: Array.isArray(proposedTags) ? proposedTags : [],
    });
    await Prompt.findByIdAndUpdate(id, { $inc: { "stats.interactions": 1 } });
    await publishDomainEvent("pr.created", {
      promptId: id,
      promptOwnerUid: prompt.authorUid,
      prId: pr._id.toString(),
      prTitle: pr.title,
      actorUid: uid,
      actorUsername: username,
    });

    res.status(201).json({
      success: true,
      pullRequest: formatPr(pr),
    });
  } catch (err) {
    console.error("[prompt-service] POST pull-request error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to create pull request" });
  }
});

/**
 * GET /api/prompts/:id/pull-requests/:prId
 * Get a single pull request.
 */
router.get("/:prId", optionalAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const prId = req.params.prId;

    const prompt = await Prompt.findById(id);
    if (!prompt) {
      return res.status(404).json({ success: false, error: "Prompt not found" });
    }

    const pr = await PullRequest.findOne({ _id: prId, promptId: id }).lean();
    if (!pr) {
      return res.status(404).json({ success: false, error: "Pull request not found" });
    }

    res.json({
      success: true,
      pullRequest: formatPr(pr, {
        viewerUid: req.uid ?? null,
        promptOwnerUid: prompt.authorUid ?? null,
      }),
    });
  } catch (err) {
    console.error("[prompt-service] GET pull-request error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to fetch pull request" });
  }
});

/**
 * GET /api/prompts/:id/pull-requests/:prId/discussions
 * List discussion thread for a pull request.
 */
router.get("/:prId/discussions", async (req, res) => {
  try {
    const id = req.params.id;
    const prId = req.params.prId;

    const prompt = await Prompt.findById(id);
    if (!prompt) {
      return res.status(404).json({ success: false, error: "Prompt not found" });
    }
    const pr = await PullRequest.findOne({ _id: prId, promptId: id }).lean();
    if (!pr) {
      return res.status(404).json({ success: false, error: "Pull request not found" });
    }

    const discussions = (pr.comments ?? []).map((c) => ({
      id: c._id.toString(),
      author: c.authorUsername,
      authorUid: c.authorUid ?? null,
      body: c.body,
      createdAt: formatRelative(c.createdAt),
    }));

    res.json({
      success: true,
      discussions,
      discussionCount: discussions.length,
    });
  } catch (err) {
    console.error("[prompt-service] GET PR discussions error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to fetch discussions" });
  }
});

async function appendPrDiscussion(req, res) {
  const uid = req.uid;
  const id = req.params.id;
  const prId = req.params.prId;
  const { body, authorUsername } = req.body;

  const prompt = await Prompt.findById(id);
  if (!prompt) {
    return res.status(404).json({ success: false, error: "Prompt not found" });
  }
  const pr = await PullRequest.findOne({ _id: prId, promptId: id });
  if (!pr) {
    return res.status(404).json({ success: false, error: "Pull request not found" });
  }
  if (pr.status !== "open") {
    return res.status(400).json({ success: false, error: "Cannot comment on closed/merged PR" });
  }
  if (!body || typeof body !== "string" || !body.trim()) {
    return res.status(400).json({ success: false, error: "body is required" });
  }
  const username = (authorUsername ?? "").toString().trim().toLowerCase() || "unknown";

  pr.comments = pr.comments ?? [];
  pr.comments.push({
    authorUid: uid,
    authorUsername: username,
    body: body.trim(),
  });
  await pr.save();
  await Prompt.findByIdAndUpdate(id, { $inc: { "stats.interactions": 1 } });
  const recipientUids = [...new Set([prompt.authorUid, pr.authorUid].filter(Boolean))];
  await publishDomainEvent("pr.commented", {
    promptId: id,
    prId: pr._id.toString(),
    prTitle: pr.title,
    recipientUids,
    actorUid: uid,
    actorUsername: username,
  });

  const comment = pr.comments[pr.comments.length - 1];
  return res.status(201).json({
    success: true,
    comment: {
      id: comment._id.toString(),
      author: comment.authorUsername,
      authorUid: comment.authorUid ?? null,
      body: comment.body,
      createdAt: formatRelative(comment.createdAt),
    },
    discussionCount: pr.comments.length,
  });
}

/**
 * POST /api/prompts/:id/pull-requests/:prId/comments
 * Add a comment to a pull request. Requires auth.
 */
router.post("/:prId/comments", requireAuth, async (req, res) => {
  try {
    return await appendPrDiscussion(req, res);
  } catch (err) {
    console.error("[prompt-service] POST PR comment error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to add comment" });
  }
});

/**
 * POST /api/prompts/:id/pull-requests/:prId/discussions
 * Add a discussion comment to a pull request. Requires auth.
 */
router.post("/:prId/discussions", requireAuth, async (req, res) => {
  try {
    return await appendPrDiscussion(req, res);
  } catch (err) {
    console.error("[prompt-service] POST PR discussion error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to add discussion" });
  }
});

/**
 * POST /api/prompts/:id/pull-requests/:prId/merge
 * Merge a pull request (prompt owner only). Requires auth.
 */
router.post("/:prId/merge", requireAuth, async (req, res) => {
  try {
    const uid = req.uid;
    const id = req.params.id;
    const prId = req.params.prId;

    const prompt = await Prompt.findById(id);
    if (!prompt) {
      return res.status(404).json({ success: false, error: "Prompt not found" });
    }
    if (prompt.authorUid !== uid) {
      return res.status(403).json({ success: false, error: "Only the prompt owner can merge PRs" });
    }

    const pr = await PullRequest.findOne({ _id: prId, promptId: id });
    if (!pr) {
      return res.status(404).json({ success: false, error: "Pull request not found" });
    }
    if (pr.status !== "open") {
      return res.status(400).json({ success: false, error: "Pull request is not open" });
    }

    const updates = {};
    if (pr.proposedPrimaryPrompt != null) updates.primaryPrompt = pr.proposedPrimaryPrompt;
    if (pr.proposedGuide !== undefined) updates.guide = pr.proposedGuide;
    if (pr.proposedTags?.length) updates.tags = pr.proposedTags;

    if (Object.keys(updates).length > 0) {
      await Prompt.findByIdAndUpdate(id, { $set: updates });
    }

    pr.status = "merged";
    await pr.save();
    await publishDomainEvent("pr.merged", {
      promptId: id,
      prId: pr._id.toString(),
      prTitle: pr.title,
      prAuthorUid: pr.authorUid,
      actorUid: uid,
      actorUsername: prompt.authorUsername ?? null,
    });

    res.json({
      success: true,
      pullRequest: formatPr(pr, {
        viewerUid: uid,
        promptOwnerUid: prompt.authorUid ?? null,
      }),
    });
  } catch (err) {
    console.error("[prompt-service] Merge PR error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to merge" });
  }
});

/**
 * POST /api/prompts/:id/pull-requests/:prId/close
 * Close a pull request (prompt owner or PR author). Requires auth.
 */
router.post("/:prId/close", requireAuth, async (req, res) => {
  try {
    const uid = req.uid;
    const id = req.params.id;
    const prId = req.params.prId;

    const prompt = await Prompt.findById(id);
    if (!prompt) {
      return res.status(404).json({ success: false, error: "Prompt not found" });
    }

    const pr = await PullRequest.findOne({ _id: prId, promptId: id });
    if (!pr) {
      return res.status(404).json({ success: false, error: "Pull request not found" });
    }
    const isOwner = prompt.authorUid === uid;
    const isAuthor = pr.authorUid === uid;
    if (!isOwner && !isAuthor) {
      return res.status(403).json({ success: false, error: "Not authorized to close this PR" });
    }
    if (pr.status !== "open") {
      return res.status(400).json({ success: false, error: "Pull request is not open" });
    }

    pr.status = "closed";
    await pr.save();

    res.json({
      success: true,
      pullRequest: formatPr(pr, {
        viewerUid: uid,
        promptOwnerUid: prompt.authorUid ?? null,
      }),
    });
  } catch (err) {
    console.error("[prompt-service] Close PR error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to close" });
  }
});

export default router;
