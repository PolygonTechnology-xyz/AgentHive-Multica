export type ApiErrorBody = { statusCode: number; error: string; message: string };

export class ApiError extends Error {
  statusCode: number;
  error: string;

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.statusCode = body.statusCode;
    this.error = body.error;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

async function parseError(response: Response): Promise<ApiErrorBody> {
  try {
    const body = (await response.json()) as Partial<ApiErrorBody>;
    return { statusCode: body.statusCode ?? response.status, error: body.error ?? response.statusText, message: body.message ?? "Request failed" };
  } catch {
    return { statusCode: response.status, error: response.statusText, message: "Request failed" };
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = path.startsWith("http") ? path : API_URL + (path.startsWith("/") ? path : "/" + path);
  const isFormData = init.body instanceof FormData;
  const headers = isFormData ? init.headers : { "Content-Type": "application/json", ...(init.headers ?? {}) };
  const response = await fetch(url, { ...init, credentials: "include", headers });
  if (!response.ok) throw new ApiError(await parseError(response));
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
