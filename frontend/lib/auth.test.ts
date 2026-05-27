import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieGet = vi.fn();
const redirect = vi.fn((to: string) => {
  throw new Error("REDIRECT:" + to);
});

vi.mock("next/headers", () => ({
  cookies: () => ({ get: cookieGet }),
}));

vi.mock("next/navigation", () => ({
  redirect: (to: string) => redirect(to),
}));

const decodeMock = vi.fn();

vi.mock("@/lib/session", async () => {
  const actual = await vi.importActual<typeof import("@/lib/session")>("@/lib/session");
  return {
    ...actual,
    decodeSessionToken: (token: string | undefined) => decodeMock(token),
  };
});

import { getClientSessionUser, getServerSessionUser, requireRole } from "./auth";

beforeEach(() => {
  cookieGet.mockReset();
  redirect.mockClear();
  decodeMock.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("getServerSessionUser", () => {
  it("returns null when no known cookie has a decodable user", () => {
    cookieGet.mockReturnValue(undefined);
    decodeMock.mockReturnValue(null);
    expect(getServerSessionUser()).toBeNull();
  });

  it("returns user from the first cookie that decodes successfully", () => {
    const user = { id: "1", email: "a@b.com", role: "buyer" as const, verified: true };
    cookieGet.mockImplementation((name: string) => (name === "agenthive_session" ? { value: "tok" } : undefined));
    decodeMock.mockImplementation((token: string | undefined) => (token === "tok" ? user : null));
    expect(getServerSessionUser()).toEqual(user);
  });

  it("falls through to next cookie when an earlier one does not decode", () => {
    const user = { id: "1", email: "a@b.com", role: "admin" as const, verified: true };
    cookieGet.mockImplementation((name: string) => {
      if (name === "agenthive_session") return { value: "bad" };
      if (name === "session") return { value: "good" };
      return undefined;
    });
    decodeMock.mockImplementation((token: string | undefined) => (token === "good" ? user : null));
    expect(getServerSessionUser()).toEqual(user);
  });
});

describe("requireRole", () => {
  it("redirects to /login/<role> when no user", () => {
    cookieGet.mockReturnValue(undefined);
    decodeMock.mockReturnValue(null);
    expect(() => requireRole("buyer")).toThrow("REDIRECT:/login/buyer");
    expect(redirect).toHaveBeenCalledWith("/login/buyer");
  });

  it("redirects to role dashboard when user role mismatches", () => {
    cookieGet.mockImplementation(() => ({ value: "tok" }));
    decodeMock.mockReturnValue({ id: "1", email: "x@y.com", role: "admin", verified: true });
    expect(() => requireRole("buyer")).toThrow("REDIRECT:/admin");
    expect(redirect).toHaveBeenCalledWith("/admin");
  });

  it("returns user when role matches", () => {
    const user = { id: "1", email: "x@y.com", role: "freelancer" as const, verified: true };
    cookieGet.mockImplementation(() => ({ value: "tok" }));
    decodeMock.mockReturnValue(user);
    expect(requireRole("freelancer")).toEqual(user);
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe("getClientSessionUser", () => {
  it("returns the same user passed in", () => {
    const user = { id: "1", email: "x@y.com", role: "buyer" as const, verified: true };
    expect(getClientSessionUser(user)).toBe(user);
  });

  it("returns null when passed null", () => {
    expect(getClientSessionUser(null)).toBeNull();
  });
});
