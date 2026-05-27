import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { CliConfig, readConfig } from './config';

export interface LoginResult {
  user: { id: string; email: string; displayName?: string; role?: string };
  accessToken: string;
}

export interface BidderAgent {
  id: string;
  userId: string;
  nlConfig?: string;
  bidThreshold?: number;
  maxBidAmount?: number;
  autoBidEnabled?: boolean;
  status?: string;
  // anything else the backend chooses to return
  [key: string]: unknown;
}

export interface ApiClientOptions {
  apiUrl?: string;
  accessToken?: string;
}

/**
 * Resolve the API base URL. Precedence: explicit option > env > config > default.
 */
export function resolveApiUrl(opt?: string): string {
  if (opt && opt.length > 0) return stripTrailingSlash(opt);
  if (process.env.AGENTHIVE_API_URL) return stripTrailingSlash(process.env.AGENTHIVE_API_URL);
  const cfg = readConfig();
  return stripTrailingSlash(cfg.api_url);
}

function stripTrailingSlash(s: string): string {
  return s.endsWith('/') ? s.slice(0, -1) : s;
}

export function createClient(opts: ApiClientOptions = {}): AxiosInstance {
  const baseURL = resolveApiUrl(opts.apiUrl);
  const cfg = readConfig();
  const token = opts.accessToken ?? cfg.access_token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['Cookie'] = `access_token=${token}`;
  }

  return axios.create({
    baseURL,
    headers,
    timeout: 30000,
    // Don't throw on 4xx so commands can format friendly errors.
    validateStatus: () => true,
  });
}

/**
 * Extract `access_token=<value>` from a `set-cookie` header.
 * Returns null if not found. Handles both the array and string forms axios may yield.
 */
export function extractAccessTokenCookie(setCookie: unknown): string | null {
  if (!setCookie) return null;
  const arr = Array.isArray(setCookie) ? setCookie : [String(setCookie)];
  for (const c of arr) {
    const m = /(?:^|;\s*)access_token=([^;]+)/.exec(c);
    if (m && m[1]) {
      return decodeURIComponent(m[1].trim());
    }
  }
  return null;
}

export async function login(
  email: string,
  password: string,
  opts: ApiClientOptions = {},
): Promise<LoginResult> {
  const client = createClient({ apiUrl: opts.apiUrl });
  const res: AxiosResponse = await client.post('/auth/login', { email, password });
  if (res.status < 200 || res.status >= 300) {
    throw apiError(res, 'Login failed');
  }

  const token = extractAccessTokenCookie(res.headers?.['set-cookie']);
  if (!token) {
    throw new Error('Login response did not include an access_token cookie.');
  }

  const data = res.data?.data ?? res.data ?? {};
  const user = data.user ?? data;
  return {
    accessToken: token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    },
  };
}

export async function logout(opts: ApiClientOptions = {}): Promise<void> {
  const client = createClient(opts);
  const res = await client.post('/auth/logout');
  if (res.status >= 400 && res.status !== 401) {
    // 401 just means our token is already invalid; continue.
    throw apiError(res, 'Logout failed');
  }
}

export async function getBidderAgent(opts: ApiClientOptions = {}): Promise<BidderAgent> {
  const client = createClient(opts);
  const res = await client.get('/bidder-agent/me');
  if (res.status < 200 || res.status >= 300) {
    throw apiError(res, 'Failed to fetch bidder agent');
  }
  return res.data as BidderAgent;
}

export async function updateBidderAgent(
  body: Partial<{ nlConfig: string; bidThreshold: number; maxBidAmount: number; autoBidEnabled: boolean }>,
  opts: ApiClientOptions = {},
): Promise<BidderAgent> {
  const client = createClient(opts);
  const res = await client.patch('/bidder-agent/me', body);
  if (res.status < 200 || res.status >= 300) {
    throw apiError(res, 'Failed to update bidder agent');
  }
  return res.data as BidderAgent;
}

export interface DeliverPayload {
  message?: string;
  attachments?: { name: string; url: string }[];
}

export async function submitDelivery(
  dispatchId: string,
  body: DeliverPayload,
  opts: ApiClientOptions = {},
): Promise<unknown> {
  const client = createClient(opts);
  const res = await client.post(`/dispatch/${encodeURIComponent(dispatchId)}/deliver`, body);
  if (res.status < 200 || res.status >= 300) {
    throw apiError(res, 'Failed to submit delivery');
  }
  return res.data;
}

function apiError(res: AxiosResponse, fallback: string): Error {
  const body = res.data;
  const msg =
    (body && (body.message || body.error || (Array.isArray(body) && body.join(', ')))) ||
    fallback;
  const detail = typeof msg === 'string' ? msg : JSON.stringify(msg);
  return new Error(`${fallback} (${res.status}): ${detail}`);
}

export const __test__ = { stripTrailingSlash, apiError };
