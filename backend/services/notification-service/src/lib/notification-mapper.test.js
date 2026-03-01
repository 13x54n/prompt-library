import test from "node:test";
import assert from "node:assert/strict";
import { mapEventToNotifications } from "./notification-mapper.js";
import { processDomainEvent } from "./event-processor.js";

test("maps prompt.forked into one notification", () => {
  const event = {
    eventId: "evt-1",
    eventType: "prompt.forked",
    occurredAt: new Date().toISOString(),
    payload: {
      promptId: "p1",
      promptTitle: "SEO Prompt",
      promptOwnerUid: "owner-1",
      actorUid: "actor-1",
      actorUsername: "alice",
    },
  };
  const notifications = mapEventToNotifications(event);
  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].type, "prompt_forked");
  assert.equal(notifications[0].recipientUid, "owner-1");
  assert.equal(notifications[0].eventId, "evt-1:prompt_forked:owner-1");
});

test("maps discussion.answer.created into answered + replied notifications", () => {
  const event = {
    eventId: "evt-2",
    eventType: "discussion.answer.created",
    occurredAt: new Date().toISOString(),
    payload: {
      promptId: "p2",
      questionId: "q2",
      answerId: "a2",
      questionAuthorUid: "q-owner",
      threadParticipantUids: ["q-owner", "u-2", "u-3", "actor-1"],
      actorUid: "actor-1",
      actorUsername: "bob",
    },
  };
  const notifications = mapEventToNotifications(event);
  assert.equal(notifications.length, 3);
  const types = notifications.map((n) => n.type).sort();
  assert.deepEqual(types, ["discussion_answered", "discussion_replied", "discussion_replied"]);
  assert.ok(notifications.every((n) => n.recipientUid !== "actor-1"));
});

test("processDomainEvent ignores duplicate key errors", async () => {
  const event = {
    eventId: "evt-3",
    eventType: "pr.created",
    occurredAt: new Date().toISOString(),
    payload: {
      promptId: "p3",
      promptOwnerUid: "owner-3",
      prId: "pr3",
      prTitle: "Improve docs",
      actorUid: "actor-3",
      actorUsername: "carol",
    },
  };

  const duplicateKeyError = { code: 11000 };
  const fakeModel = {
    insertMany: async () => {
      throw duplicateKeyError;
    },
  };

  const result = await processDomainEvent(event, { notificationModel: fakeModel });
  assert.equal(result.success, true);
  assert.equal(result.inserted, 0);
});

test("maps user.followed to follower notification", () => {
  const event = {
    eventId: "evt-4",
    eventType: "user.followed",
    occurredAt: new Date().toISOString(),
    payload: {
      followerUid: "u-follower",
      followeeUid: "u-followee",
      actorUid: "u-follower",
      actorUsername: "alice",
    },
  };
  const notifications = mapEventToNotifications(event);
  assert.equal(notifications.length, 1);
  assert.equal(notifications[0].type, "user_followed");
  assert.equal(notifications[0].recipientUid, "u-followee");
  assert.equal(notifications[0].link, "/profile/u-follower");
});
