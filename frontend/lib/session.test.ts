import { describe, expect, it } from "vitest";
import {
  dashboardForRole,
  decodeSessionToken,
  getSessionFromCookieHeader,
  readSessionCookie,
} from "./session";

function encodePayload(payload: Record<string, unknown>) {
  const json = JSON.stringify(payload);
  return Buffer.from(json, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function makeToken(payload: Record<string, unknown>) {
  return "header." + encodePayload(payload) + ".sig";
}

describe("readSessionCookie", () => {
  it("returns null when header is missing", () => {
    expect(readSessionCookie(null)).toBeNull();
    expect(readSessionCookie(undefined)).toBeNull();
    expect(readSessionCookie("")).toBeNull();
  });

  it("returns null when no known cookie name is present", () => {
    expect(readSessionCookie("other=value; foo=bar")).toBeNull();
  });

  it("reads value from agenthive_session", () => {
    expect(readSessionCookie("agenthive_session=token123; other=1")).toBe("token123");
  });

  it("reads value from session cookie", () => {
    expect(readSessionCookie("session=abc")).toBe("abc");
  });

  it("reads value from access_token", () => {
    expect(readSessionCookie("access_token=xyz")).toBe("xyz");
  });

  it("decodes URL-encoded cookie value", () => {
    expect(readSessionCookie("agenthive_session=a%20b")).toBe("a b");
  });

  it("prefers agenthive_session over session when both present", () => {
    expect(readSessionCookie("session=b; agenthive_session=a")).toBe("a");
  });
});

describe("decodeSessionToken", () => {
  it("returns null when token is missing", () => {
    expect(decodeSessionToken(null)).toBeNull();
    expect(decodeSessionToken(undefined)).toBeNull();
    expect(decodeSessionToken("")).toBeNull();
  });

  it("returns null when token has no payload segment", () => {
    expect(decodeSessionToken("onlyheader")).toBeNull();
  });

  it("returns null when payload is not valid base64 JSON", () => {
    expect(decodeSessionToken("header.!!notbase64!!.sig")).toBeNull();
  });

  it("returns null when payload is missing role", () => {
    const token = makeToken({ email: "u@x.com" });
    expect(decodeSessionToken(token)).toBeNull();
  });

  it("returns null when payload is missing email", () => {
    const token = makeToken({ role: "buyer" });
    expect(decodeSessionToken(token)).toBeNull();
  });

  it("decodes a complete payload using sub for id", () => {
    const token = makeToken({ sub: "u1", email: "u@x.com", role: "buyer", name: "U", verified: true });
    expect(decodeSessionToken(token)).toEqual({
      id: "u1",
      email: "u@x.com",
      name: "U",
      role: "buyer",
      verified: true,
    });
  });

  it("falls back to id field when sub absent", () => {
    const token = makeToken({ id: "u2", email: "x@y.com", role: "freelancer" });
    expect(decodeSessionToken(token)).toMatchObject({ id: "u2", verified: false });
  });

  it("defaults id to empty string and verified to false when neither sub nor id provided", () => {
    const token = makeToken({ email: "x@y.com", role: "admin" });
    expect(decodeSessionToken(token)).toEqual({
      id: "",
      email: "x@y.com",
      name: undefined,
      role: "admin",
      verified: false,
    });
  });
});

describe("getSessionFromCookieHeader", () => {
  it("returns null when no cookie", () => {
    expect(getSessionFromCookieHeader(null)).toBeNull();
  });

  it("returns user when a valid token cookie is present", () => {
    const token = makeToken({ sub: "u1", email: "a@b.com", role: "buyer" });
    const user = getSessionFromCookieHeader("agenthive_session=" + token);
    expect(user).toMatchObject({ id: "u1", role: "buyer" });
  });
});

describe("dashboardForRole", () => {
  it("maps buyer to buyer dashboard", () => {
    expect(dashboardForRole("buyer")).toBe("/dashboard/buyer");
  });

  it("maps freelancer to freelancer dashboard", () => {
    expect(dashboardForRole("freelancer")).toBe("/dashboard/freelancer");
  });

  it("maps admin to /admin", () => {
    expect(dashboardForRole("admin")).toBe("/admin");
  });
});
