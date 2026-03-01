function addRecord(records, baseEvent, record) {
  if (!record.recipientUid) return;
  const dedupeEventId = `${baseEvent.eventId}:${record.type}:${record.recipientUid}`;
  records.push({
    ...record,
    eventId: dedupeEventId,
    eventType: baseEvent.eventType,
    metadata: baseEvent.payload ?? {},
  });
}

function actorLabel(payload) {
  return payload.actorUsername ? `@${payload.actorUsername}` : "Someone";
}

function shouldSkipSelf(payload, recipientUid) {
  return Boolean(payload.actorUid && recipientUid && payload.actorUid === recipientUid);
}

export function mapEventToNotifications(event) {
  const records = [];
  const payload = event.payload ?? {};
  const actor = actorLabel(payload);

  switch (event.eventType) {
    case "prompt.forked": {
      if (!payload.promptOwnerUid || shouldSkipSelf(payload, payload.promptOwnerUid)) break;
      addRecord(records, event, {
        recipientUid: payload.promptOwnerUid,
        type: "prompt_forked",
        actorUid: payload.actorUid ?? null,
        actorUsername: payload.actorUsername ?? null,
        entityType: "prompt",
        entityId: String(payload.promptId),
        promptId: String(payload.promptId),
        title: "Your prompt was forked",
        body: `${actor} forked ${payload.promptTitle ?? "your prompt"}`,
        link: `/prompts/${payload.promptId}`,
      });
      break;
    }
    case "prompt.upvoted": {
      if (!payload.promptOwnerUid || shouldSkipSelf(payload, payload.promptOwnerUid)) break;
      addRecord(records, event, {
        recipientUid: payload.promptOwnerUid,
        type: "prompt_upvoted",
        actorUid: payload.actorUid ?? null,
        actorUsername: payload.actorUsername ?? null,
        entityType: "prompt",
        entityId: String(payload.promptId),
        promptId: String(payload.promptId),
        title: "New upvote on your prompt",
        body: `${actor} upvoted ${payload.promptTitle ?? "your prompt"}`,
        link: `/prompts/${payload.promptId}`,
      });
      break;
    }
    case "discussion.question.created": {
      if (!payload.promptOwnerUid || shouldSkipSelf(payload, payload.promptOwnerUid)) break;
      addRecord(records, event, {
        recipientUid: payload.promptOwnerUid,
        type: "discussion_question_on_my_prompt",
        actorUid: payload.actorUid ?? null,
        actorUsername: payload.actorUsername ?? null,
        entityType: "discussion_question",
        entityId: String(payload.questionId),
        promptId: String(payload.promptId),
        title: "New discussion question on your prompt",
        body: `${actor} asked: ${payload.questionTitle ?? "New question"}`,
        link: `/prompts/${payload.promptId}#discussion-${payload.questionId}`,
      });
      break;
    }
    case "discussion.answer.created": {
      if (payload.questionAuthorUid && !shouldSkipSelf(payload, payload.questionAuthorUid)) {
        addRecord(records, event, {
          recipientUid: payload.questionAuthorUid,
          type: "discussion_answered",
          actorUid: payload.actorUid ?? null,
          actorUsername: payload.actorUsername ?? null,
          entityType: "discussion_answer",
          entityId: String(payload.answerId),
          promptId: String(payload.promptId),
          title: "Your discussion got a new answer",
          body: `${actor} answered your question`,
          link: `/prompts/${payload.promptId}#discussion-${payload.questionId}`,
        });
      }
      const recipients = Array.isArray(payload.threadParticipantUids)
        ? payload.threadParticipantUids
        : [];
      for (const recipientUid of recipients) {
        if (!recipientUid || shouldSkipSelf(payload, recipientUid) || recipientUid === payload.questionAuthorUid) {
          continue;
        }
        addRecord(records, event, {
          recipientUid,
          type: "discussion_replied",
          actorUid: payload.actorUid ?? null,
          actorUsername: payload.actorUsername ?? null,
          entityType: "discussion_answer",
          entityId: String(payload.answerId),
          promptId: String(payload.promptId),
          title: "New reply in a discussion you joined",
          body: `${actor} replied in a discussion thread`,
          link: `/prompts/${payload.promptId}#discussion-${payload.questionId}`,
        });
      }
      break;
    }
    case "pr.created": {
      if (!payload.promptOwnerUid || shouldSkipSelf(payload, payload.promptOwnerUid)) break;
      addRecord(records, event, {
        recipientUid: payload.promptOwnerUid,
        type: "pr_created",
        actorUid: payload.actorUid ?? null,
        actorUsername: payload.actorUsername ?? null,
        entityType: "pull_request",
        entityId: String(payload.prId),
        promptId: String(payload.promptId),
        title: "New pull request on your prompt",
        body: `${actor} opened PR: ${payload.prTitle ?? "Untitled PR"}`,
        link: `/prompts/${payload.promptId}/pull-requests?pr=${payload.prId}`,
      });
      break;
    }
    case "pr.commented": {
      const recipients = Array.isArray(payload.recipientUids) ? payload.recipientUids : [];
      for (const recipientUid of recipients) {
        if (!recipientUid || shouldSkipSelf(payload, recipientUid)) continue;
        addRecord(records, event, {
          recipientUid,
          type: "pr_commented",
          actorUid: payload.actorUid ?? null,
          actorUsername: payload.actorUsername ?? null,
          entityType: "pull_request",
          entityId: String(payload.prId),
          promptId: String(payload.promptId),
          title: "New comment on a pull request",
          body: `${actor} commented on PR: ${payload.prTitle ?? "Untitled PR"}`,
          link: `/prompts/${payload.promptId}/pull-requests?pr=${payload.prId}`,
        });
      }
      break;
    }
    case "pr.merged": {
      if (!payload.prAuthorUid || shouldSkipSelf(payload, payload.prAuthorUid)) break;
      addRecord(records, event, {
        recipientUid: payload.prAuthorUid,
        type: "pr_merged",
        actorUid: payload.actorUid ?? null,
        actorUsername: payload.actorUsername ?? null,
        entityType: "pull_request",
        entityId: String(payload.prId),
        promptId: String(payload.promptId),
        title: "Your pull request was merged",
        body: `${actor} merged your PR: ${payload.prTitle ?? "Untitled PR"}`,
        link: `/prompts/${payload.promptId}/pull-requests?pr=${payload.prId}`,
      });
      break;
    }
    case "user.followed": {
      if (!payload.followeeUid || shouldSkipSelf(payload, payload.followeeUid)) break;
      addRecord(records, event, {
        recipientUid: payload.followeeUid,
        type: "user_followed",
        actorUid: payload.actorUid ?? null,
        actorUsername: payload.actorUsername ?? null,
        entityType: "user",
        entityId: String(payload.followeeUid),
        promptId: null,
        title: "You have a new follower",
        body: `${actor} followed you`,
        link: payload.actorUid
          ? `/profile/${payload.actorUid}`
          : payload.actorUsername
            ? `/profile/${payload.actorUsername}`
            : "/",
      });
      break;
    }
    default:
      break;
  }

  return records;
}
