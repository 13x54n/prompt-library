import { describe, expect, it } from "vitest";
import { formatRelative } from "./utils";

describe("formatRelative", () => {
  it("returns just now for recent dates", () => {
    expect(formatRelative(new Date())).toBe("just now");
  });

  it("returns minute granularity", () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelative(date)).toBe("5m ago");
  });
});
