import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "./api";

type FetchMock = ReturnType<typeof vi.fn>;

function mockResponse(body: unknown, init: Partial<Response> = {}) {
  const status = init.status ?? 200;
  const statusText = init.statusText ?? "OK";
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: async () => body,
  } as unknown as Response;
}

describe("ApiError", () => {
  it("sets message, name, statusCode and error from body", () => {
    const err = new ApiError({ statusCode: 404, error: "Not Found", message: "missing" });
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ApiError");
    expect(err.message).toBe("missing");
    expect(err.statusCode).toBe(404);
    expect(err.error).toBe("Not Found");
  });
});

describe("apiFetch", () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    fetchMock = vi.fn();
    // @ts-expect-error override global fetch in test
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed JSON on 2xx response", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ hello: "world" }));
    const result = await apiFetch<{ hello: string }>("/ping");
    expect(result).toEqual({ hello: "world" });
  });

  it("prepends API base URL when path begins with /", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({}));
    await apiFetch("/users");
    const [url] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/api\/v1\/users$/);
  });

  it("inserts / when path is missing leading slash", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({}));
    await apiFetch("users");
    const [url] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/api\/v1\/users$/);
  });

  it("does not prepend base when path starts with http", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({}));
    await apiFetch("https://example.com/raw");
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("https://example.com/raw");
  });

  it("sends credentials: include and JSON content-type", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({}));
    await apiFetch("/x");
    const [, init] = fetchMock.mock.calls[0];
    expect(init.credentials).toBe("include");
    expect(init.headers["Content-Type"]).toBe("application/json");
  });

  it("merges caller headers with defaults", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({}));
    await apiFetch("/x", { headers: { Authorization: "Bearer abc" } });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe("Bearer abc");
    expect(init.headers["Content-Type"]).toBe("application/json");
  });

  it("returns undefined on 204 No Content", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(null, { status: 204, statusText: "No Content" }));
    const result = await apiFetch("/delete");
    expect(result).toBeUndefined();
  });

  it("throws ApiError with parsed JSON body on non-2xx", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({ statusCode: 400, error: "Bad Request", message: "nope" }, { status: 400, statusText: "Bad Request" }),
    );
    await expect(apiFetch("/x")).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 400,
      error: "Bad Request",
      message: "nope",
    });
  });

  it("throws ApiError with fallback fields when error JSON is incomplete", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({}, { status: 500, statusText: "Server Error" }));
    await expect(apiFetch("/x")).rejects.toMatchObject({
      statusCode: 500,
      error: "Server Error",
      message: "Request failed",
    });
  });

  it("throws ApiError with fallback when error body is not JSON", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 502,
      statusText: "Bad Gateway",
      json: async () => {
        throw new Error("not json");
      },
    } as unknown as Response);
    await expect(apiFetch("/x")).rejects.toMatchObject({
      statusCode: 502,
      error: "Bad Gateway",
      message: "Request failed",
    });
  });
});
