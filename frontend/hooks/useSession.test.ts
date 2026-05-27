import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const apiFetchMock = vi.fn();

vi.mock("@/lib/api", () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
  ApiError: class ApiError extends Error {},
}));

import { useSession } from "./useSession";

beforeEach(() => {
  apiFetchMock.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useSession", () => {
  it("starts in loading state with no user", () => {
    apiFetchMock.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useSession());
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("resolves with user on success", async () => {
    const user = { id: "1", email: "a@b.com", role: "buyer", verified: true };
    apiFetchMock.mockResolvedValueOnce(user);
    const { result } = renderHook(() => useSession());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual(user);
    expect(result.current.error).toBeNull();
  });

  it("captures error on failure and clears user", async () => {
    const err = new Error("boom");
    apiFetchMock.mockRejectedValueOnce(err);
    const { result } = renderHook(() => useSession());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe(err);
  });

  it("calls /auth/me", () => {
    apiFetchMock.mockResolvedValueOnce(null);
    renderHook(() => useSession());
    expect(apiFetchMock).toHaveBeenCalledWith("/auth/me");
  });

  it("ignores resolution after unmount", async () => {
    let resolve!: (v: unknown) => void;
    apiFetchMock.mockReturnValueOnce(new Promise((r) => { resolve = r; }));
    const { result, unmount } = renderHook(() => useSession());
    unmount();
    resolve({ id: "1", email: "x@y.com", role: "admin", verified: true });
    // Wait a tick to ensure the resolution callback ran.
    await Promise.resolve();
    // State should remain at initial values because effect cleanup set active=false.
    expect(result.current.user).toBeNull();
  });
});
