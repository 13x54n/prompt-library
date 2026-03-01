import test from "node:test";
import assert from "node:assert/strict";
import { toPublicUser } from "./public-user.js";

test("toPublicUser removes private fields", () => {
  const user = {
    uid: "u1",
    username: "alice",
    displayName: "Alice",
    photoURL: "https://example.com/a.png",
    bio: "bio",
    website: "https://example.com",
    email: "alice@example.com",
    createdAt: "2026-01-01T00:00:00.000Z",
  };

  const output = toPublicUser(user);
  assert.equal(output.uid, "u1");
  assert.equal(output.username, "alice");
  assert.equal("email" in output, false);
});
