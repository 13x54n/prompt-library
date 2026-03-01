import { Router } from "express";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { Prompt } from "../models/Prompt.js";
import { DiscussionQuestion } from "../models/DiscussionQuestion.js";
import { DiscussionAnswer } from "../models/DiscussionAnswer.js";
import { publishDomainEvent } from "../lib/event-publisher.js";
import { ensurePromptAccessOr404 } from "../lib/prompt-visibility.js";
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

function formatAnswerDoc(answer) {
  return {
    id: answer._id.toString(),
    questionId: answer.questionId.toString(),
    parentAnswerId: answer.parentAnswerId ? answer.parentAnswerId.toString() : null,
    depth: answer.depth ?? 0,
    content: answer.content,
    author: answer.authorUsername,
    authorUid: answer.authorUid,
    createdAt: formatRelative(answer.createdAt),
    votes: answer.votes ?? 0,
    accepted: answer.accepted ?? false,
    replies: [],
  };
}

function buildAnswerTree(answers) {
  const byId = new Map();
  const rootsByQuestion = {};

  for (const answer of answers) {
    byId.set(answer.id, answer);
  }

  for (const answer of answers) {
    if (answer.parentAnswerId && byId.has(answer.parentAnswerId)) {
      byId.get(answer.parentAnswerId).replies.push(answer);
      continue;
    }
    if (!rootsByQuestion[answer.questionId]) rootsByQuestion[answer.questionId] = [];
    rootsByQuestion[answer.questionId].push(answer);
  }

  return rootsByQuestion;
}

/**
 * GET /api/prompts/:id/discussions
 * List discussion questions for a prompt.
 * Mount at /:id/discussions
 */
router.get("/", optionalAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const prompt = await Prompt.findById(id).lean();
    if (!ensurePromptAccessOr404(res, prompt, req.uid ?? null)) return;

    const questions = await DiscussionQuestion.find({ promptId: id })
      .sort({ createdAt: -1 })
      .lean();

    const answerCounts = await DiscussionAnswer.aggregate([
      { $match: { questionId: { $in: questions.map((q) => q._id) }, parentAnswerId: null } },
      { $group: { _id: "$questionId", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(answerCounts.map((a) => [a._id.toString(), a.count]));

    const questionsWithCounts = questions.map((q) => ({
      id: q._id.toString(),
      title: q.title,
      body: q.body,
      author: q.authorUsername,
      authorUid: q.authorUid,
      createdAt: formatRelative(q.createdAt),
      votes: q.votes ?? 0,
      answerCount: countMap[q._id.toString()] ?? 0,
      acceptedAnswerId: q.acceptedAnswerId?.toString(),
    }));

    const questionIds = questions.map((q) => q._id);
    const answers = await DiscussionAnswer.find({ questionId: { $in: questionIds } })
      .sort({ createdAt: 1 })
      .lean();

    const normalizedAnswers = answers.map(formatAnswerDoc);
    const answersByQuestion = buildAnswerTree(normalizedAnswers);

    res.json({
      success: true,
      questions: questionsWithCounts,
      answersByQuestion,
    });
  } catch (err) {
    console.error("[prompt-service] GET discussions error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to fetch discussions" });
  }
});

/**
 * POST /api/prompts/:id/discussions
 * Create a new discussion question. Requires auth.
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const uid = req.uid;
    const id = req.params.id;
    const { title, body, authorUsername } = req.body;

    const prompt = await Prompt.findById(id).lean();
    if (!ensurePromptAccessOr404(res, prompt, uid)) return;
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ success: false, error: "title is required" });
    }
    if (!body || typeof body !== "string" || !body.trim()) {
      return res.status(400).json({ success: false, error: "body is required" });
    }
    const username = (authorUsername ?? "").toString().trim().toLowerCase() || "unknown";

    const question = await DiscussionQuestion.create({
      promptId: id,
      title: title.trim(),
      body: body.trim(),
      authorUid: uid,
      authorUsername: username,
    });
    await Prompt.findByIdAndUpdate(id, { $inc: { "stats.interactions": 1 } });
    await publishDomainEvent("discussion.question.created", {
      promptId: id,
      promptOwnerUid: prompt.authorUid,
      questionId: question._id.toString(),
      questionTitle: question.title,
      actorUid: uid,
      actorUsername: username,
    });

    res.status(201).json({
      success: true,
      question: {
        id: question._id.toString(),
        title: question.title,
        body: question.body,
        author: question.authorUsername,
        authorUid: question.authorUid,
        createdAt: formatRelative(question.createdAt),
        votes: 0,
        answerCount: 0,
      },
    });
  } catch (err) {
    console.error("[prompt-service] POST discussion error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to create question" });
  }
});

/**
 * POST /api/prompts/:id/discussions/:qId/answers
 * Add an answer to a question. Requires auth.
 */
async function createAnswer(req, res, forcedParentAnswerId = undefined) {
  const uid = req.uid;
  const id = req.params.id;
  const qId = req.params.qId;
  const { content, authorUsername } = req.body;
  const parentAnswerId = forcedParentAnswerId ?? req.body?.parentAnswerId ?? null;

  const prompt = await Prompt.findById(id).lean();
  if (!ensurePromptAccessOr404(res, prompt, uid)) return;
  const question = await DiscussionQuestion.findById(qId);
  if (!question || question.promptId.toString() !== id) {
    return res.status(404).json({ success: false, error: "Question not found" });
  }
  if (!content || typeof content !== "string" || !content.trim()) {
    return res.status(400).json({ success: false, error: "content is required" });
  }
  const username = (authorUsername ?? "").toString().trim().toLowerCase() || "unknown";

  let parentAnswer = null;
  let depth = 0;
  if (parentAnswerId) {
    parentAnswer = await DiscussionAnswer.findOne({ _id: parentAnswerId, questionId: qId }).lean();
    if (!parentAnswer) {
      return res.status(404).json({ success: false, error: "Parent answer not found" });
    }
    depth = (parentAnswer.depth ?? 0) + 1;
  }

  const previousAnswers = await DiscussionAnswer.find({ questionId: qId })
    .select("authorUid")
    .lean();

  const answer = await DiscussionAnswer.create({
    questionId: qId,
    parentAnswerId: parentAnswer?._id ?? null,
    depth,
    content: content.trim(),
    authorUid: uid,
    authorUsername: username,
  });
  await Prompt.findByIdAndUpdate(id, { $inc: { "stats.interactions": 1 } });
  const threadParticipantUids = [
    ...new Set(
      [
        question.authorUid,
        ...previousAnswers.map((a) => a.authorUid).filter(Boolean),
      ].filter(Boolean)
    ),
  ];
  await publishDomainEvent("discussion.answer.created", {
    promptId: id,
    questionId: qId,
    answerId: answer._id.toString(),
    parentAnswerId: parentAnswer?._id?.toString() ?? null,
    answerContentPreview: answer.content.slice(0, 180),
    questionAuthorUid: question.authorUid,
    threadParticipantUids,
    actorUid: uid,
    actorUsername: username,
  });

  return res.status(201).json({
    success: true,
    answer: {
      id: answer._id.toString(),
      questionId: qId,
      parentAnswerId: answer.parentAnswerId ? answer.parentAnswerId.toString() : null,
      depth: answer.depth ?? 0,
      content: answer.content,
      author: answer.authorUsername,
      authorUid: answer.authorUid,
      createdAt: formatRelative(answer.createdAt),
      votes: 0,
      accepted: false,
      replies: [],
    },
  });
}

router.post("/:qId/answers", requireAuth, async (req, res) => {
  try {
    return await createAnswer(req, res);
  } catch (err) {
    console.error("[prompt-service] POST answer error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to post answer" });
  }
});

/**
 * POST /api/prompts/:id/discussions/:qId/answers/:aId/replies
 * Reply to an answer/reply. Requires auth.
 */
router.post("/:qId/answers/:aId/replies", requireAuth, async (req, res) => {
  try {
    return await createAnswer(req, res, req.params.aId);
  } catch (err) {
    console.error("[prompt-service] POST answer reply error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to post reply" });
  }
});

/**
 * GET /api/prompts/:id/discussions/:qId/thread
 * Get the full threaded answers for one question.
 */
router.get("/:qId/thread", optionalAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const qId = req.params.qId;

    const prompt = await Prompt.findById(id).lean();
    if (!ensurePromptAccessOr404(res, prompt, req.uid ?? null)) return;
    const question = await DiscussionQuestion.findOne({ _id: qId, promptId: id }).lean();
    if (!question) {
      return res.status(404).json({ success: false, error: "Question not found" });
    }

    const answers = await DiscussionAnswer.find({ questionId: qId }).sort({ createdAt: 1 }).lean();
    const threadedAnswers = buildAnswerTree(answers.map(formatAnswerDoc))[qId] ?? [];

    res.json({
      success: true,
      question: {
        id: question._id.toString(),
        title: question.title,
        body: question.body,
        author: question.authorUsername,
        authorUid: question.authorUid,
        createdAt: formatRelative(question.createdAt),
        votes: question.votes ?? 0,
        acceptedAnswerId: question.acceptedAnswerId?.toString(),
      },
      answers: threadedAnswers,
    });
  } catch (err) {
    console.error("[prompt-service] GET discussion thread error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to fetch thread" });
  }
});

/**
 * POST /api/prompts/:id/discussions/:qId/answers/:aId/accept
 * Accept an answer (prompt owner only). Requires auth.
 */
router.post("/:qId/answers/:aId/accept", requireAuth, async (req, res) => {
  try {
    const uid = req.uid;
    const id = req.params.id;
    const qId = req.params.qId;
    const aId = req.params.aId;

    const prompt = await Prompt.findById(id).lean();
    if (!ensurePromptAccessOr404(res, prompt, uid)) return;
    if (prompt.authorUid !== uid) {
      return res.status(403).json({ success: false, error: "Only the prompt owner can accept answers" });
    }

    const question = await DiscussionQuestion.findById(qId);
    if (!question || question.promptId.toString() !== id) {
      return res.status(404).json({ success: false, error: "Question not found" });
    }
    const answer = await DiscussionAnswer.findById(aId);
    if (!answer || answer.questionId.toString() !== qId) {
      return res.status(404).json({ success: false, error: "Answer not found" });
    }
    if (answer.parentAnswerId) {
      return res.status(400).json({ success: false, error: "Only top-level answers can be accepted" });
    }

    await DiscussionAnswer.updateMany({ questionId: qId, parentAnswerId: null }, { $set: { accepted: false } });
    await DiscussionAnswer.findByIdAndUpdate(aId, { $set: { accepted: true } });
    await DiscussionQuestion.findByIdAndUpdate(qId, { $set: { acceptedAnswerId: aId } });

    res.json({ success: true, accepted: true });
  } catch (err) {
    console.error("[prompt-service] Accept answer error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to accept answer" });
  }
});

/**
 * POST /api/prompts/:id/discussions/:qId/vote
 * Toggle vote on a question. Requires auth.
 */
router.post("/:qId/vote", requireAuth, async (req, res) => {
  try {
    const uid = req.uid;
    const id = req.params.id;
    const qId = req.params.qId;

    const prompt = await Prompt.findById(id).lean();
    if (!ensurePromptAccessOr404(res, prompt, uid)) return;
    const question = await DiscussionQuestion.findOne({ _id: qId, promptId: id });
    if (!question) {
      return res.status(404).json({ success: false, error: "Question not found" });
    }

    const voteUids = question.voteUids ?? [];
    const hasVoted = voteUids.includes(uid);
    let newVoteUids, delta;
    if (hasVoted) {
      newVoteUids = voteUids.filter((u) => u !== uid);
      delta = -1;
    } else {
      newVoteUids = [...voteUids, uid];
      delta = 1;
    }

    await DiscussionQuestion.findByIdAndUpdate(qId, {
      $set: { voteUids: newVoteUids },
      $inc: { votes: delta },
    });
    await Prompt.findByIdAndUpdate(id, { $inc: { "stats.interactions": delta } });

    const updated = await DiscussionQuestion.findById(qId).lean();
    res.json({ success: true, votes: updated.votes ?? 0 });
  } catch (err) {
    console.error("[prompt-service] Vote question error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to vote" });
  }
});

/**
 * POST /api/prompts/:id/discussions/:qId/answers/:aId/vote
 * Toggle vote on an answer. Requires auth.
 */
router.post("/:qId/answers/:aId/vote", requireAuth, async (req, res) => {
  try {
    const uid = req.uid;
    const id = req.params.id;
    const qId = req.params.qId;
    const aId = req.params.aId;

    const prompt = await Prompt.findById(id).lean();
    if (!ensurePromptAccessOr404(res, prompt, uid)) return;
    const question = await DiscussionQuestion.findOne({ _id: qId, promptId: id });
    if (!question) {
      return res.status(404).json({ success: false, error: "Question not found" });
    }
    const answer = await DiscussionAnswer.findOne({ _id: aId, questionId: qId });
    if (!answer) {
      return res.status(404).json({ success: false, error: "Answer not found" });
    }

    const voteUids = answer.voteUids ?? [];
    const hasVoted = voteUids.includes(uid);
    let newVoteUids, delta;
    if (hasVoted) {
      newVoteUids = voteUids.filter((u) => u !== uid);
      delta = -1;
    } else {
      newVoteUids = [...voteUids, uid];
      delta = 1;
    }

    await DiscussionAnswer.findByIdAndUpdate(aId, {
      $set: { voteUids: newVoteUids },
      $inc: { votes: delta },
    });
    await Prompt.findByIdAndUpdate(id, { $inc: { "stats.interactions": delta } });

    const updated = await DiscussionAnswer.findById(aId).lean();
    res.json({ success: true, votes: updated.votes ?? 0 });
  } catch (err) {
    console.error("[prompt-service] Vote answer error:", err);
    res.status(500).json({ success: false, error: err.message ?? "Failed to vote" });
  }
});

export default router;
