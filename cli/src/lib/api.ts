import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { CliConfig, readConfig } from './config';

export interface LoginResult {
  user: { id: string; email: string; displayName?: string; role?: string };
  accessToken: string;
  expiresIn?: number;
}

export interface WorkforceAgent {
  id: string;
  userId?: string;
  name: string;
  skillIndex?: string[];
  skills?: string[];
  status: string;
  [key: string]: unknown;
}

export interface ApiClientOptions {
  apiUrl?: string;
  accessToken?: string;
}

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
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return axios.create({
    baseURL,
    headers,
    timeout: 30000,
    validateStatus: () => true,
  });
}

export async function login(
  email: string,
  password: string,
  opts: ApiClientOptions = {},
): Promise<LoginResult> {
  const client = createClient({ apiUrl: opts.apiUrl });
  const res: AxiosResponse = await client.post('/auth/login', { email, password });
  if (res.status < 200 || res.status >= 300) throw apiError(res, 'Login failed');

  const data = res.data?.data ?? res.data ?? {};
  const token = data.accessToken;
  if (!token || typeof token !== 'string') {
    throw new Error('Login response did not include an accessToken.');
  }

  const user = data.user ?? {};
  return {
    accessToken: token,
    expiresIn: data.expiresIn,
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
  if (res.status >= 400 && res.status !== 401) throw apiError(res, 'Logout failed');
}

export async function createWorkforceAgent(
  body: { name: string; skills: string[] },
  opts: ApiClientOptions = {},
): Promise<WorkforceAgent> {
  const client = createClient(opts);
  const res = await client.post('/workforce-agents', body);
  if (res.status < 200 || res.status >= 300) throw apiError(res, 'Failed to connect agent');
  return res.data?.data ?? res.data;
}

export async function listWorkforceAgents(opts: ApiClientOptions = {}): Promise<WorkforceAgent[]> {
  const client = createClient(opts);
  const res = await client.get('/workforce-agents');
  if (res.status < 200 || res.status >= 300) throw apiError(res, 'Failed to list agents');
  return res.data?.data ?? res.data;
}

export async function deactivateWorkforceAgent(id: string, opts: ApiClientOptions = {}): Promise<WorkforceAgent> {
  const client = createClient(opts);
  const res = await client.patch(`/workforce-agents/${encodeURIComponent(id)}/deactivate`);
  if (res.status < 200 || res.status >= 300) throw apiError(res, 'Failed to deactivate agent');
  return res.data?.data ?? res.data;
}

export async function removeWorkforceAgent(id: string, opts: ApiClientOptions = {}): Promise<WorkforceAgent> {
  const client = createClient(opts);
  const res = await client.delete(`/workforce-agents/${encodeURIComponent(id)}`);
  if (res.status < 200 || res.status >= 300) throw apiError(res, 'Failed to remove agent');
  return res.data?.data ?? res.data;
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
  if (res.status < 200 || res.status >= 300) throw apiError(res, 'Failed to submit delivery');
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
