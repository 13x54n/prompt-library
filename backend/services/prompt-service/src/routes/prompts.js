import { Router } from "express";
import { Prompt } from "../models/Prompt.js";
import { Upvote } from "../models/Upvote.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { publishDomainEvent } from "../lib/event-publisher.js";
import { ensurePromptAccessOr404 } from "../lib/prompt-visibility.js";
import discussionsRoutes from "./discussions.js";
import pullRequestsRoutes from "./pull-requests.js";

const router = Router();

// Mount sub-routes BEFORE /:id so they match first
router.use("/:id/discussions", discussionsRoutes);
router.use("/:id/pull-requests", pullRequestsRoutes);

function formatPrompt(doc) {
  const p = doc.toObject ? doc.toObject() : doc;
  return {
    id: p._id.toString(),
    title: p.title,
    description: p.description ?? "",
    tags: p.tags ?? [],
    stats: {
      upvotes: p.stats?.upvotes ?? 0,
      forks: p.stats?.forks ?? 0,
      views: p.stats?.views ?? 0,
      interactions: p.stats?.interactions ?? 0,
    },
    lastUpdated: p.updatedAt,
    username: p.authorUsername,
    primaryPrompt: p.primaryPrompt,
    parameters: p.parameters ?? [],
    variants: p.variants ?? [],
    guide: p.guide ?? null,
    visibility: p.visibility ?? "public",
    isPinned: p.isPinned ?? false,
    parentPromptId: p.parentPromptId ? p.parentPromptId.toString() : null,
    authorUid: p.authorUid,
  };
}

function visibilityFilterFor(uid = null) {
  const publicFilter = [{ visibility: "public" }, { visibility: { $exists: false } }];
  if (!uid) return { $or: publicFilter };
  return { $or: [...publicFilter, { authorUid: uid }] };
}

/**
 * GET /api/prompts
 * List prompts with optional filters: author, tags, search, limit, offset, sort
 */
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { author, authorUids, tags, q, limit = 20, offset = 0, sort = "createdAt" } = req.query;
    const viewerUid = req.uid ?? null;

    const andClauses = [visibilityFilterFor(viewerUid)];

    if (authorUids) {
      const uids = String(authorUids)
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean);
      if (uids.length > 0) {
        andClauses.push({ authorUid: { $in: [...new Set(uids)] } });
      }
    }

    if (author) {
      andClauses.push({
        $or: [{ authorUsername: author.toLowerCase() }, { authorUid: author }],
      });
    }

    if (tags) {
      const tagList = Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim()).filter(Boolean);
      if (tagList.length > 0) {
        const tagConditions = tagList.map((t) => {
          const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          return { tags: { $elemMatch: { $regex: new RegExp(`^${escaped}$`, "i") } } };
        });
        andClauses.push(tagConditions.length === 1 ? tagConditions[0] : { $or: tagConditions });
      }
    }

    if (q && String(q).trim()) {
      const search = String(q).trim();
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      andClauses.push({
        $or: [
          { title: { $regex: escaped, $options: "i" } },
          { description: { $regex: escaped, $options: "i" } },
          { tags: { $regex: escaped, $options: "i" } },
        ],
      });
    }
    const filter = andClauses.length === 1 ? andClauses[0] : { $and: andClauses };

    const sortField = { createdAt: -1 };
    if (sort === "upvotes") sortField["stats.upvotes"] = -1;
    if (sort === "views") sortField["stats.views"] = -1;
    if (sort === "updatedAt") sortField.updatedAt = -1;

    const prompts = await Prompt.find(filter)
      .sort(sortField)
      .skip(Number(offset) || 0)
      .limit(Math.min(Number(limit) || 20, 100))
      .lean();

    const total = await Prompt.countDocuments(filter);

    res.json({
      success: true,
      prompts: prompts.map((p) => formatPrompt(p)),
      total,
    });
  } catch (err) {
    console.error("[prompt-service] GET /prompts error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to list prompts" });
  }
});

/**
 * GET /api/prompts/tags/popular
 * Returns most used tags across the database by appearance count.
 */
router.get("/tags/popular", optionalAuth, async (req, res) => {
  try {
    const viewerUid = req.uid ?? null;
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const q = String(req.query.q ?? "").trim();
    const visibilityFilter = visibilityFilterFor(viewerUid);

    const pipeline = [
      { $match: visibilityFilter },
      { $unwind: "$tags" },
      { $match: { tags: { $exists: true, $ne: "", $type: "string" } } },
      { $group: { _id: { $toLower: "$tags" }, count: { $sum: 1 } } },
      { $match: { _id: { $ne: "" } } },
    ];
    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      pipeline.push({ $match: { _id: { $regex: escaped, $options: "i" } } });
    }
    pipeline.push({ $sort: { count: -1 } });
    pipeline.push({ $limit: limit });
    pipeline.push({ $project: { tag: "$_id", count: 1, _id: 0 } });

    const results = await Prompt.aggregate(pipeline);

    const tags = results.map((r) => r.tag);
    res.json({ success: true, tags });
  } catch (err) {
    console.error("[prompt-service] GET /tags/popular error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch popular tags" });
  }
});

/**
 * GET /api/prompts/by-author/:username
 * List prompts by author username.
 */
router.get("/by-author/:username", optionalAuth, async (req, res) => {
  try {
    const username = (req.params.username ?? "").trim().toLowerCase();
    const viewerUid = req.uid ?? null;
    if (!username) {
      return res.status(400).json({ success: false, error: "username is required" });
    }

    const prompts = await Prompt.find({
      authorUsername: username,
      ...visibilityFilterFor(viewerUid),
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      prompts: prompts.map((p) => formatPrompt(p)),
    });
  } catch (err) {
    console.error("[prompt-service] GET /by-author error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to list prompts" });
  }
});

/**
 * GET /api/prompts/by-author-uid/:uid
 * List prompts by author uid (canonical identity key).
 */
router.get("/by-author-uid/:uid", optionalAuth, async (req, res) => {
  try {
    const uid = (req.params.uid ?? "").trim();
    const viewerUid = req.uid ?? null;
    if (!uid) {
      return res.status(400).json({ success: false, error: "uid is required" });
    }

    const prompts = await Prompt.find({
      authorUid: uid,
      ...visibilityFilterFor(viewerUid),
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      prompts: prompts.map((p) => formatPrompt(p)),
    });
  } catch (err) {
    console.error("[prompt-service] GET /by-author-uid error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to list prompts" });
  }
});

/**
 * GET /api/prompts/activity/:username
 * Contribution activity for a user profile:
 * - prompts created (timeline)
 * - pull requests authored (grouped by prompt)
 * - discussion questions authored (timeline)
 * - discussion answers authored (grouped by prompt)
 */
router.get("/activity/:username", optionalAuth, async (req, res) => {
  try {
    const username = (req.params.username ?? "").trim().toLowerCase();
    const viewerUid = req.uid ?? null;
    if (!username) {
      return res.status(400).json({ success: false, error: "username is required" });
    }

    const { DiscussionQuestion } = await import("../models/DiscussionQuestion.js");
    const { DiscussionAnswer } = await import("../models/DiscussionAnswer.js");
    const { PullRequest } = await import("../models/PullRequest.js");

    const [createdPromptsRaw, questions, answers, prs] = await Promise.all([
      Prompt.find({ authorUsername: username, ...visibilityFilterFor(viewerUid) })
        .select("_id title createdAt")
        .sort({ createdAt: -1 })
        .lean(),
      DiscussionQuestion.find({ authorUsername: username })
        .select("_id promptId title createdAt")
        .sort({ createdAt: -1 })
        .lean(),
      DiscussionAnswer.find({ authorUsername: username })
        .select("questionId createdAt")
        .lean(),
      PullRequest.find({ authorUsername: username })
        .select("promptId createdAt")
        .lean(),
    ]);

    const answerQuestionIds = [...new Set(answers.map((a) => a.questionId?.toString()).filter(Boolean))];
    const answerQuestions = answerQuestionIds.length
      ? await DiscussionQuestion.find({ _id: { $in: answerQuestionIds } }).select("_id promptId").lean()
      : [];
    const answerQuestionToPrompt = new Map(
      answerQuestions.map((q) => [q._id.toString(), q.promptId?.toString()]).filter(([, p]) => !!p)
    );

    const promptIds = new Set();
    for (const q of questions) if (q.promptId) promptIds.add(q.promptId.toString());
    for (const p of prs) if (p.promptId) promptIds.add(p.promptId.toString());
    for (const a of answers) {
      const pid = answerQuestionToPrompt.get(a.questionId?.toString());
      if (pid) promptIds.add(pid);
    }

    const prompts = promptIds.size
      ? await Prompt.find({
          _id: { $in: [...promptIds] },
          ...visibilityFilterFor(viewerUid),
        }).select("_id title").lean()
      : [];
    const promptTitleById = new Map(prompts.map((p) => [p._id.toString(), p.title]));
    const visiblePromptIdSet = new Set(prompts.map((p) => p._id.toString()));

    const prsByPromptMap = {};
    for (const pr of prs) {
      const pid = pr.promptId?.toString();
      if (!pid || !visiblePromptIdSet.has(pid)) continue;
      prsByPromptMap[pid] = (prsByPromptMap[pid] ?? 0) + 1;
    }
    const prsByPrompt = Object.entries(prsByPromptMap).map(([promptId, count]) => ({
      promptId,
      promptTitle: promptTitleById.get(promptId) ?? "Untitled prompt",
      count,
    }));

    const answersByPromptMap = {};
    for (const answer of answers) {
      const pid = answerQuestionToPrompt.get(answer.questionId?.toString());
      if (!pid || !visiblePromptIdSet.has(pid)) continue;
      answersByPromptMap[pid] = (answersByPromptMap[pid] ?? 0) + 1;
    }
    const answersByPrompt = Object.entries(answersByPromptMap).map(([promptId, count]) => ({
      promptId,
      promptTitle: promptTitleById.get(promptId) ?? "Untitled prompt",
      count,
    }));

    const discussionQuestions = questions.map((q) => {
      const promptId = q.promptId?.toString() ?? "";
      if (!visiblePromptIdSet.has(promptId)) return null;
      return {
        id: q._id.toString(),
        promptId,
        promptTitle: promptTitleById.get(promptId) ?? "Untitled prompt",
        title: q.title,
        createdAt: q.createdAt,
      };
    }).filter(Boolean);

    const createdPrompts = createdPromptsRaw.map((p) => ({
      promptId: p._id.toString(),
      promptTitle: p.title,
      createdAt: p.createdAt,
    }));

    res.json({
      success: true,
      activity: {
        createdPrompts,
        prsByPrompt,
        discussionQuestions,
        answersByPrompt,
      },
    });
  } catch (err) {
    console.error("[prompt-service] GET /activity/:username error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to get activity" });
  }
});

/**
 * GET /api/prompts/activity/by-uid/:uid
 * Contribution activity keyed by canonical uid.
 */
router.get("/activity/by-uid/:uid", optionalAuth, async (req, res) => {
  try {
    const uid = (req.params.uid ?? "").trim();
    const viewerUid = req.uid ?? null;
    if (!uid) {
      return res.status(400).json({ success: false, error: "uid is required" });
    }

    const { DiscussionQuestion } = await import("../models/DiscussionQuestion.js");
    const { DiscussionAnswer } = await import("../models/DiscussionAnswer.js");
    const { PullRequest } = await import("../models/PullRequest.js");

    const [createdPromptsRaw, questions, answers, prs] = await Promise.all([
      Prompt.find({ authorUid: uid, ...visibilityFilterFor(viewerUid) })
        .select("_id title createdAt")
        .sort({ createdAt: -1 })
        .lean(),
      DiscussionQuestion.find({ authorUid: uid })
        .select("_id promptId title createdAt")
        .sort({ createdAt: -1 })
        .lean(),
      DiscussionAnswer.find({ authorUid: uid })
        .select("questionId createdAt")
        .lean(),
      PullRequest.find({ authorUid: uid })
        .select("promptId createdAt")
        .lean(),
    ]);

    const answerQuestionIds = [...new Set(answers.map((a) => a.questionId?.toString()).filter(Boolean))];
    const answerQuestions = answerQuestionIds.length
      ? await DiscussionQuestion.find({ _id: { $in: answerQuestionIds } }).select("_id promptId").lean()
      : [];
    const answerQuestionToPrompt = new Map(
      answerQuestions.map((q) => [q._id.toString(), q.promptId?.toString()]).filter(([, p]) => !!p)
    );

    const promptIds = new Set();
    for (const q of questions) if (q.promptId) promptIds.add(q.promptId.toString());
    for (const p of prs) if (p.promptId) promptIds.add(p.promptId.toString());
    for (const a of answers) {
      const pid = answerQuestionToPrompt.get(a.questionId?.toString());
      if (pid) promptIds.add(pid);
    }

    const prompts = promptIds.size
      ? await Prompt.find({
          _id: { $in: [...promptIds] },
          ...visibilityFilterFor(viewerUid),
        }).select("_id title").lean()
      : [];
    const promptTitleById = new Map(prompts.map((p) => [p._id.toString(), p.title]));
    const visiblePromptIdSet = new Set(prompts.map((p) => p._id.toString()));

    const prsByPromptMap = {};
    for (const pr of prs) {
      const pid = pr.promptId?.toString();
      if (!pid || !visiblePromptIdSet.has(pid)) continue;
      prsByPromptMap[pid] = (prsByPromptMap[pid] ?? 0) + 1;
    }
    const prsByPrompt = Object.entries(prsByPromptMap).map(([promptId, count]) => ({
      promptId,
      promptTitle: promptTitleById.get(promptId) ?? "Untitled prompt",
      count,
    }));

    const answersByPromptMap = {};
    for (const answer of answers) {
      const pid = answerQuestionToPrompt.get(answer.questionId?.toString());
      if (!pid || !visiblePromptIdSet.has(pid)) continue;
      answersByPromptMap[pid] = (answersByPromptMap[pid] ?? 0) + 1;
    }
    const answersByPrompt = Object.entries(answersByPromptMap).map(([promptId, count]) => ({
      promptId,
      promptTitle: promptTitleById.get(promptId) ?? "Untitled prompt",
      count,
    }));

    const discussionQuestions = questions.map((q) => {
      const promptId = q.promptId?.toString() ?? "";
      if (!visiblePromptIdSet.has(promptId)) return null;
      return {
        id: q._id.toString(),
        promptId,
        promptTitle: promptTitleById.get(promptId) ?? "Untitled prompt",
        title: q.title,
        createdAt: q.createdAt,
      };
    }).filter(Boolean);

    const createdPrompts = createdPromptsRaw.map((p) => ({
      promptId: p._id.toString(),
      promptTitle: p.title,
      createdAt: p.createdAt,
    }));

    res.json({
      success: true,
      activity: {
        createdPrompts,
        prsByPrompt,
        discussionQuestions,
        answersByPrompt,
      },
    });
  } catch (err) {
    console.error("[prompt-service] GET /activity/by-uid/:uid error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to get activity" });
  }
});

/**
 * GET /api/prompts/search-discussions?q=...
 * Search discussion questions globally, including:
 * - question title/body/author
 * - answer content/author
 * - related prompt metadata
 */
router.get("/search-discussions", optionalAuth, async (req, res) => {
  try {
    const q = String(req.query.q ?? "").trim();
    const limit = Math.min(Number(req.query.limit) || 8, 25);
    const viewerUid = req.uid ?? null;
    if (!q) {
      return res.json({ success: true, discussions: [] });
    }

    const { DiscussionQuestion } = await import("../models/DiscussionQuestion.js");
    const { DiscussionAnswer } = await import("../models/DiscussionAnswer.js");
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const matchedPrompts = await Prompt.find({
      $and: [
        {
          $or: [
            { title: { $regex: escaped, $options: "i" } },
            { description: { $regex: escaped, $options: "i" } },
            { tags: { $regex: escaped, $options: "i" } },
            { authorUsername: { $regex: escaped, $options: "i" } },
          ],
        },
        visibilityFilterFor(viewerUid),
      ],
    })
      .select("_id title")
      .limit(200)
      .lean();
    const matchedPromptIds = matchedPrompts.map((p) => p._id);

    const directQuestionMatches = await DiscussionQuestion.find({
      $or: [
        { title: { $regex: escaped, $options: "i" } },
        { body: { $regex: escaped, $options: "i" } },
        { authorUsername: { $regex: escaped, $options: "i" } },
        ...(matchedPromptIds.length ? [{ promptId: { $in: matchedPromptIds } }] : []),
      ],
    })
      .select("_id")
      .limit(200)
      .lean();

    const answerMatches = await DiscussionAnswer.find({
      $or: [
        { content: { $regex: escaped, $options: "i" } },
        { authorUsername: { $regex: escaped, $options: "i" } },
      ],
    })
      .select("questionId content")
      .limit(400)
      .lean();

    const matchedQuestionIdSet = new Set();
    for (const qDoc of directQuestionMatches) {
      matchedQuestionIdSet.add(qDoc._id.toString());
    }
    for (const ans of answerMatches) {
      if (ans.questionId) matchedQuestionIdSet.add(ans.questionId.toString());
    }

    const matchedQuestionIds = [...matchedQuestionIdSet];
    if (!matchedQuestionIds.length) {
      return res.json({ success: true, discussions: [] });
    }

    const questions = await DiscussionQuestion.find({
      _id: { $in: matchedQuestionIds },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const questionPromptIds = [...new Set(questions.map((qDoc) => qDoc.promptId?.toString()).filter(Boolean))];
    const visiblePromptDocs = questionPromptIds.length
      ? await Prompt.find({
          _id: { $in: questionPromptIds },
          ...visibilityFilterFor(viewerUid),
        }).select("_id title").lean()
      : [];
    const visiblePromptIdSet = new Set(visiblePromptDocs.map((p) => p._id.toString()));
    const visibleQuestions = questions.filter((qDoc) => visiblePromptIdSet.has(qDoc.promptId?.toString() ?? ""));
    const qIds = visibleQuestions.map((qDoc) => qDoc._id);
    const [answerCounts, relatedPrompts] = await Promise.all([
      qIds.length
        ? DiscussionAnswer.aggregate([
            { $match: { questionId: { $in: qIds } } },
            { $group: { _id: "$questionId", count: { $sum: 1 } } },
          ])
        : [],
      Prompt.find({ _id: { $in: visibleQuestions.map((qDoc) => qDoc.promptId).filter(Boolean) } })
        .select("_id title")
        .lean(),
    ]);
    const counts = Object.fromEntries(answerCounts.map((a) => [a._id.toString(), a.count]));
    const promptTitles = Object.fromEntries(relatedPrompts.map((p) => [p._id.toString(), p.title]));

    const matchedAnswerSnippetByQuestion = {};
    for (const ans of answerMatches) {
      const key = ans.questionId?.toString();
      if (!key || matchedAnswerSnippetByQuestion[key]) continue;
      matchedAnswerSnippetByQuestion[key] = ans.content?.slice(0, 120) ?? "";
    }

    res.json({
      success: true,
      discussions: visibleQuestions.map((qDoc) => ({
        id: qDoc._id.toString(),
        promptId: qDoc.promptId?.toString() ?? "",
        promptTitle: promptTitles[qDoc.promptId?.toString() ?? ""] ?? "Untitled prompt",
        title: qDoc.title,
        body: qDoc.body,
        matchedAnswerSnippet: matchedAnswerSnippetByQuestion[qDoc._id.toString()] ?? null,
        author: qDoc.authorUsername,
        votes: qDoc.votes ?? 0,
        answerCount: counts[qDoc._id.toString()] ?? 0,
      })),
    });
  } catch (err) {
    console.error("[prompt-service] GET search/discussions error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to search discussions" });
  }
});

/**
 * GET /api/prompts/:id/upvote-status
 * Returns whether current user has upvoted. Uses optional auth.
 */
router.get("/:id/upvote-status", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const uid = req.uid;
    if (!uid) {
      return res.json({ success: true, upvoted: false });
    }
    const prompt = await Prompt.findById(id).lean();
    if (!ensurePromptAccessOr404(res, prompt, uid ?? null)) return;
    if (prompt.authorUid === uid) {
      return res.status(400).json({
        success: false,
        error: "You cannot upvote your own prompt",
      });
    }
    const existing = await Upvote.findOne({ promptId: id, uid });
    res.json({ success: true, upvoted: !!existing });
  } catch (err) {
    console.error("[prompt-service] Upvote status error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to check upvote" });
  }
});

/**
 * POST /api/prompts/:id/upvote
 * Toggle upvote on a prompt. Requires auth.
 */
router.post("/:id/upvote", requireAuth, async (req, res) => {
  try {
    const uid = req.uid;
    const { id } = req.params;
    const actorUsername = (req.body?.authorUsername ?? "").toString().trim().toLowerCase() || null;

    const prompt = await Prompt.findById(id);
    if (!ensurePromptAccessOr404(res, prompt, uid)) return;

    const existing = await Upvote.findOne({ promptId: id, uid });
    let upvoted;
    if (existing) {
      await Upvote.deleteOne({ _id: existing._id });
      await Prompt.findByIdAndUpdate(id, {
        $inc: { "stats.upvotes": -1, "stats.interactions": -1 },
      });
      upvoted = false;
    } else {
      await Upvote.create({ promptId: id, uid });
      await Prompt.findByIdAndUpdate(id, {
        $inc: { "stats.upvotes": 1, "stats.interactions": 1 },
      });
      upvoted = true;
      await publishDomainEvent("prompt.upvoted", {
        promptId: id,
        promptTitle: prompt.title ?? "Untitled prompt",
        promptOwnerUid: prompt.authorUid,
        actorUid: uid,
        actorUsername,
      });
    }

    const updated = await Prompt.findById(id).lean();
    res.json({
      success: true,
      upvoted,
      upvotes: updated.stats?.upvotes ?? 0,
    });
  } catch (err) {
    console.error("[prompt-service] Upvote error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to upvote" });
  }
});

/**
 * POST /api/prompts/:id/fork
 * Fork a prompt. Creates a copy under the current user. Requires auth.
 */
router.post("/:id/fork", requireAuth, async (req, res) => {
  try {
    const uid = req.uid;
    const { id } = req.params;
    const { authorUsername } = req.body;

    const source = await Prompt.findById(id).lean();
    if (!ensurePromptAccessOr404(res, source, uid)) return;
    if (source.authorUid === uid) {
      return res.status(400).json({
        success: false,
        error: "You can only fork prompts created by other users",
      });
    }
    // Always resolve to root: forked prompts point to original for duplicate check
    const rootId = source.parentPromptId ?? source._id;
    const existingFork = await Prompt.findOne({ parentPromptId: rootId, authorUid: uid });
    if (existingFork) {
      return res.status(400).json({
        success: false,
        error: "You have already forked this prompt",
      });
    }
    const username = (authorUsername ?? "").toString().trim().toLowerCase();
    if (!username || !/^[a-z0-9_-]{3,30}$/.test(username)) {
      return res.status(400).json({
        success: false,
        error: "authorUsername is required (3–30 chars, letters, numbers, underscores, or hyphens)",
      });
    }

    const fork = await Prompt.create({
      authorUid: uid,
      authorUsername: username,
      title: source.title,
      description: source.description,
      tags: source.tags ?? [],
      primaryPrompt: source.primaryPrompt,
      guide: source.guide ?? null,
      parameters: source.parameters ?? [],
      variants: source.variants ?? [],
      stats: { upvotes: 0, forks: 0, views: 0, interactions: 0 },
      parentPromptId: rootId,
    });

    await Prompt.findByIdAndUpdate(rootId, { $inc: { "stats.forks": 1 } });
    const rootPrompt = rootId.toString() === source._id.toString() ? source : await Prompt.findById(rootId).lean();
    await publishDomainEvent("prompt.forked", {
      promptId: rootId.toString(),
      promptTitle: (rootPrompt ?? source).title ?? "Untitled prompt",
      promptOwnerUid: (rootPrompt ?? source).authorUid,
      actorUid: uid,
      actorUsername: username,
      forkedPromptId: fork._id.toString(),
    });

    res.status(201).json({
      success: true,
      prompt: formatPrompt(fork),
    });
  } catch (err) {
    console.error("[prompt-service] Fork error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to fork" });
  }
});

/**
 * GET /api/prompts/:id/contributors
 * Get contributors (authors of discussions, answers, PRs, forks).
 */
router.get("/:id/contributors", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const viewerUid = req.uid ?? null;
    const prompt = await Prompt.findById(id).lean();
    if (!ensurePromptAccessOr404(res, prompt, viewerUid)) return;

    const { DiscussionQuestion } = await import("../models/DiscussionQuestion.js");
    const { DiscussionAnswer } = await import("../models/DiscussionAnswer.js");
    const { PullRequest } = await import("../models/PullRequest.js");

    const questionIds = (
      await DiscussionQuestion.find({ promptId: id }).select("_id").lean()
    ).map((q) => q._id);
    const [questions, answers, prs] = await Promise.all([
      DiscussionQuestion.find({ promptId: id }).select("authorUid authorUsername").lean(),
      DiscussionAnswer.find({ questionId: { $in: questionIds } })
        .select("authorUid authorUsername")
        .lean(),
      PullRequest.find({ promptId: id }).select("authorUid authorUsername").lean(),
    ]);

    const contributorsByUid = {};
    const add = (uid, username, weight = 1) => {
      const normalizedUid = (uid ?? "").toString().trim();
      if (!normalizedUid) return;
      const normalizedUsername = (username ?? "").toString().trim().toLowerCase() || "unknown";
      if (!contributorsByUid[normalizedUid]) {
        contributorsByUid[normalizedUid] = { uid: normalizedUid, username: normalizedUsername, contributions: 0 };
      }
      contributorsByUid[normalizedUid].username = normalizedUsername;
      contributorsByUid[normalizedUid].contributions += weight;
    };
    add(prompt.authorUid, prompt.authorUsername, 10);
    questions.forEach((q) => add(q.authorUid, q.authorUsername, 1));
    answers.forEach((a) => add(a.authorUid, a.authorUsername, 1));
    prs.forEach((p) => add(p.authorUid, p.authorUsername, 1));

    const contributors = Object.values(contributorsByUid)
      .sort((a, b) => b.contributions - a.contributions)
      .slice(0, 20);

    res.json({ success: true, contributors });
  } catch (err) {
    console.error("[prompt-service] Contributors error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to fetch contributors" });
  }
});

/**
 * GET /api/prompts/:id
 * Get a single prompt by ID. Increments view count.
 */
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const viewerUid = req.uid ?? null;

    const prompt = await Prompt.findById(id).lean();
    if (!ensurePromptAccessOr404(res, prompt, viewerUid)) return;
    await Prompt.findByIdAndUpdate(id, { $inc: { "stats.views": 1 } });
    const withUpdatedViews = await Prompt.findById(id).lean();

    res.json({
      success: true,
      prompt: formatPrompt(withUpdatedViews ?? prompt),
    });
  } catch (err) {
    console.error("[prompt-service] GET /prompts/:id error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to get prompt" });
  }
});

/**
 * POST /api/prompts
 * Create a new prompt. Requires auth.
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const uid = req.uid;
    const {
      title,
      description,
      tags,
      primaryPrompt,
      guide,
      visibility,
      parameters,
      variants,
      isPinned,
      authorUsername,
    } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ success: false, error: "title is required" });
    }
    if (!primaryPrompt || typeof primaryPrompt !== "string" || !primaryPrompt.trim()) {
      return res.status(400).json({ success: false, error: "primaryPrompt is required" });
    }
    if (!authorUsername || typeof authorUsername !== "string" || !authorUsername.trim()) {
      return res.status(400).json({ success: false, error: "authorUsername is required" });
    }

    const username = String(authorUsername).trim().toLowerCase();
    if (!/^[a-z0-9_-]{3,30}$/.test(username)) {
      return res.status(400).json({
        success: false,
        error: "authorUsername must be 3–30 chars, letters, numbers, underscores, or hyphens",
      });
    }

    const titleTrimmed = String(title).trim();
    const existingTitle = await Prompt.findOne({
      authorUid: uid,
      title: { $regex: new RegExp(`^${titleTrimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    });
    if (existingTitle) {
      return res.status(400).json({
        success: false,
        error: "You already have a prompt with this title",
      });
    }

    const prompt = await Prompt.create({
      authorUid: uid,
      authorUsername: username,
      title: titleTrimmed,
      description: typeof description === "string" ? description.trim() : "",
      tags: Array.isArray(tags) ? tags.filter((t) => typeof t === "string").map((t) => t.trim()) : [],
      primaryPrompt: String(primaryPrompt).trim(),
      guide: typeof guide === "string" ? guide.trim() : null,
      visibility: visibility === "unlisted" ? "unlisted" : "public",
      parameters: Array.isArray(parameters) ? parameters : [],
      variants: Array.isArray(variants) ? variants : [],
      isPinned: typeof isPinned === "boolean" ? isPinned : false,
    });

    res.status(201).json({
      success: true,
      prompt: formatPrompt(prompt),
    });
  } catch (err) {
    console.error("[prompt-service] POST /prompts error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to create prompt" });
  }
});

/**
 * PATCH /api/prompts/:id
 * Update a prompt. Requires auth and ownership.
 */
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const uid = req.uid;
    const { id } = req.params;
    const { title, description, tags, primaryPrompt, guide, visibility, parameters, variants, isPinned } = req.body;

    const existing = await Prompt.findOne({ _id: id });
    if (!existing) {
      return res.status(404).json({ success: false, error: "Prompt not found" });
    }
    if (existing.authorUid !== uid) {
      return res.status(403).json({ success: false, error: "Not authorized to update this prompt" });
    }

    const updates = {};
    if (title !== undefined && typeof title === "string") updates.title = title.trim();
    if (description !== undefined && typeof description === "string") updates.description = description.trim();
    if (Array.isArray(tags)) updates.tags = tags.filter((t) => typeof t === "string").map((t) => t.trim());
    if (primaryPrompt !== undefined && typeof primaryPrompt === "string") updates.primaryPrompt = primaryPrompt.trim();
    if (guide !== undefined) updates.guide = typeof guide === "string" ? guide.trim() : null;
    if (visibility !== undefined) updates.visibility = visibility === "unlisted" ? "unlisted" : "public";
    if (Array.isArray(parameters)) updates.parameters = parameters;
    if (Array.isArray(variants)) updates.variants = variants;
    if (typeof isPinned === "boolean") updates.isPinned = isPinned;

    const prompt = await Prompt.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();

    res.json({
      success: true,
      prompt: formatPrompt(prompt),
    });
  } catch (err) {
    console.error("[prompt-service] PATCH /prompts/:id error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to update prompt" });
  }
});

/**
 * POST /api/prompts/sync-username
 * Sync all authorUsername fields for the authenticated user's records.
 * This keeps profile activity and authored prompts visible after a username change.
 */
router.post("/sync-username", requireAuth, async (req, res) => {
  try {
    const uid = req.uid;
    const username = (req.body?.username ?? "").toString().trim().toLowerCase();
    if (!username) {
      return res.status(400).json({ success: false, error: "username is required" });
    }
    if (!/^[a-z0-9_-]{3,30}$/.test(username)) {
      return res.status(400).json({
        success: false,
        error: "username must be 3–30 chars, letters, numbers, underscores, or hyphens",
      });
    }

    const { DiscussionQuestion } = await import("../models/DiscussionQuestion.js");
    const { DiscussionAnswer } = await import("../models/DiscussionAnswer.js");
    const { PullRequest } = await import("../models/PullRequest.js");

    const [promptResult, questionResult, answerResult, prResult, prCommentsResult] = await Promise.all([
      Prompt.updateMany({ authorUid: uid }, { $set: { authorUsername: username } }),
      DiscussionQuestion.updateMany({ authorUid: uid }, { $set: { authorUsername: username } }),
      DiscussionAnswer.updateMany({ authorUid: uid }, { $set: { authorUsername: username } }),
      PullRequest.updateMany({ authorUid: uid }, { $set: { authorUsername: username } }),
      PullRequest.updateMany(
        { "comments.authorUid": uid },
        { $set: { "comments.$[comment].authorUsername": username } },
        { arrayFilters: [{ "comment.authorUid": uid }] }
      ),
    ]);

    res.json({
      success: true,
      updated: {
        prompts: promptResult.modifiedCount ?? 0,
        discussionQuestions: questionResult.modifiedCount ?? 0,
        discussionAnswers: answerResult.modifiedCount ?? 0,
        pullRequests: prResult.modifiedCount ?? 0,
        pullRequestComments: prCommentsResult.modifiedCount ?? 0,
      },
    });
  } catch (err) {
    console.error("[prompt-service] POST /sync-username error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to sync username" });
  }
});

/**
 * DELETE /api/prompts/:id
 * Delete a prompt. Requires auth and ownership.
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const uid = req.uid;
    const { id } = req.params;

    const existing = await Prompt.findOne({ _id: id });
    if (!existing) {
      return res.status(404).json({ success: false, error: "Prompt not found" });
    }
    if (existing.authorUid !== uid) {
      return res.status(403).json({ success: false, error: "Not authorized to delete this prompt" });
    }

    await Prompt.findByIdAndDelete(id);

    res.json({ success: true, deleted: true });
  } catch (err) {
    console.error("[prompt-service] DELETE /prompts/:id error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to delete prompt" });
  }
});

export default router;
