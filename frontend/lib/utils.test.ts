import { describe, expect, it } from "vitest";
import { cx } from "./utils";

describe("cx", () => {
  it("joins truthy class names with spaces", () => {
    expect(cx("a", "b", "c")).toBe("a b c");
  });

  it("filters out falsy values", () => {
    expect(cx("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("returns empty string when all values are falsy", () => {
    expect(cx(false, null, undefined, "")).toBe("");
  });

  it("returns empty string with no arguments", () => {
    expect(cx()).toBe("");
  });

  it("returns single class when only one truthy provided", () => {
    expect(cx(undefined, "only")).toBe("only");
  });
});
