import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Handler<T = unknown> = (event: T) => void;

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  url: string;
  options: EventSourceInit | undefined;
  closed = false;
  onopen: Handler | null = null;
  onmessage: Handler<MessageEvent> | null = null;
  onerror: Handler<Event> | null = null;

  constructor(url: string, options?: EventSourceInit) {
    this.url = url;
    this.options = options;
    FakeEventSource.instances.push(this);
  }

  close() {
    this.closed = true;
  }
}

beforeEach(() => {
  FakeEventSource.instances = [];
  // @ts-expect-error stub global
  global.EventSource = FakeEventSource;
});

afterEach(() => {
  vi.restoreAllMocks();
});

import { useNotifications } from "./useNotifications";

describe("useNotifications", () => {
  it("opens an EventSource against the notifications endpoint with credentials", () => {
    renderHook(() => useNotifications());
    const src = FakeEventSource.instances[0];
    expect(src.url).toMatch(/\/notifications\/stream$/);
    expect(src.options).toEqual({ withCredentials: true });
  });

  it("starts with empty notifications and disconnected", () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current.notifications).toEqual([]);
    expect(result.current.connected).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("flips connected to true on open", () => {
    const { result } = renderHook(() => useNotifications());
    const src = FakeEventSource.instances[0];
    act(() => {
      src.onopen?.(new Event("open"));
    });
    expect(result.current.connected).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("prepends incoming notifications onto state", () => {
    const { result } = renderHook(() => useNotifications());
    const src = FakeEventSource.instances[0];

    const first = { id: "1", type: "x", payload: {}, read: false, created_at: "a" };
    const second = { id: "2", type: "y", payload: {}, read: false, created_at: "b" };

    act(() => {
      src.onmessage?.({ data: JSON.stringify(first) } as MessageEvent);
    });
    act(() => {
      src.onmessage?.({ data: JSON.stringify(second) } as MessageEvent);
    });

    expect(result.current.notifications.map((n) => n.id)).toEqual(["2", "1"]);
  });

  it("captures error event and marks disconnected", () => {
    const { result } = renderHook(() => useNotifications());
    const src = FakeEventSource.instances[0];
    const evt = new Event("error");
    act(() => {
      src.onerror?.(evt);
    });
    expect(result.current.connected).toBe(false);
    expect(result.current.error).toBe(evt);
  });

  it("closes the EventSource on unmount", () => {
    const { unmount } = renderHook(() => useNotifications());
    const src = FakeEventSource.instances[0];
    unmount();
    expect(src.closed).toBe(true);
  });
});
