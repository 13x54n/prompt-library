import test from "node:test";
import assert from "node:assert/strict";
import { buildDomainEvent } from "./event-publisher.js";

test("buildDomainEvent returns valid envelope", () => {
  const event = buildDomainEvent("prompt.upvoted", { promptId: "p1" });
  assert.equal(event.eventType, "prompt.upvoted");
  assert.equal(event.payload.promptId, "p1");
  assert.equal(typeof event.eventId, "string");
  assert.ok(event.occurredAt.includes("T"));
});
