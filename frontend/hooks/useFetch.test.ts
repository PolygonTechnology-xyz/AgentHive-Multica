import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const swrMock = vi.fn();

vi.mock("swr", () => ({
  default: (...args: unknown[]) => swrMock(...args),
}));

import { useFetch } from "./useFetch";

describe("useFetch", () => {
  it("returns the shape provided by SWR", () => {
    const mutate = vi.fn();
    swrMock.mockReturnValueOnce({ data: { ok: 1 }, error: undefined, isLoading: false, mutate });

    const { result } = renderHook(() => useFetch<{ ok: number }>("/path"));

    expect(result.current.data).toEqual({ ok: 1 });
    expect(result.current.error).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.mutate).toBe(mutate);
  });

  it("passes path as the SWR key and merges revalidateOnFocus default", () => {
    swrMock.mockReturnValueOnce({ data: undefined, error: undefined, isLoading: true, mutate: vi.fn() });

    renderHook(() => useFetch("/users"));

    const [key, , config] = swrMock.mock.calls[swrMock.mock.calls.length - 1];
    expect(key).toBe("/users");
    expect(config).toMatchObject({ revalidateOnFocus: false });
  });

  it("allows caller config to extend defaults", () => {
    swrMock.mockReturnValueOnce({ data: undefined, error: undefined, isLoading: false, mutate: vi.fn() });

    renderHook(() => useFetch("/users", { refreshInterval: 5000 }));

    const config = swrMock.mock.calls[swrMock.mock.calls.length - 1][2];
    expect(config).toMatchObject({ revalidateOnFocus: false, refreshInterval: 5000 });
  });

  it("accepts a null key to disable fetching", () => {
    swrMock.mockReturnValueOnce({ data: undefined, error: undefined, isLoading: false, mutate: vi.fn() });

    renderHook(() => useFetch(null));

    const [key] = swrMock.mock.calls[swrMock.mock.calls.length - 1];
    expect(key).toBeNull();
  });

  it("uses a fetcher that delegates to apiFetch", async () => {
    swrMock.mockReturnValueOnce({ data: undefined, error: undefined, isLoading: false, mutate: vi.fn() });
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ called: true }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    renderHook(() => useFetch("/u"));
    const fetcher = swrMock.mock.calls[swrMock.mock.calls.length - 1][1] as (u: string) => Promise<unknown>;
    const out = await fetcher("/u");

    expect(out).toEqual({ called: true });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
