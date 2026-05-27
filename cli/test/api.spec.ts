import axios from 'axios';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as api from '../src/lib/api';
import { writeConfig, DEFAULT_API_URL } from '../src/lib/config';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

interface FakeClient {
  post: jest.Mock;
  get: jest.Mock;
  patch: jest.Mock;
}

function makeFakeClient(): FakeClient {
  return { post: jest.fn(), get: jest.fn(), patch: jest.fn() };
}

describe('api', () => {
  let tmpHome: string;
  let fakeClient: FakeClient;
  let createSpy: jest.Mock;
  const realHome = process.env.HOME;

  beforeEach(() => {
    tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'agenthive-cli-api-'));
    process.env.HOME = tmpHome;
    delete process.env.AGENTHIVE_API_URL;

    fakeClient = makeFakeClient();
    createSpy = jest.fn(() => fakeClient as unknown as ReturnType<typeof axios.create>);
    (mockedAxios as unknown as { create: jest.Mock }).create = createSpy;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.HOME = realHome;
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  describe('resolveApiUrl', () => {
    test('uses explicit option, trims trailing slash', () => {
      expect(api.resolveApiUrl('http://x.com/api/v1/')).toBe('http://x.com/api/v1');
    });
    test('falls back to env', () => {
      process.env.AGENTHIVE_API_URL = 'http://env.test/api/v1';
      expect(api.resolveApiUrl()).toBe('http://env.test/api/v1');
    });
    test('falls back to config file', () => {
      writeConfig({ api_url: 'http://cfg.test/api/v1' });
      expect(api.resolveApiUrl()).toBe('http://cfg.test/api/v1');
    });
    test('falls back to default', () => {
      expect(api.resolveApiUrl()).toBe(DEFAULT_API_URL);
    });
  });

  describe('createClient', () => {
    test('omits auth headers when no token stored', () => {
      api.createClient();
      expect(createSpy).toHaveBeenCalledTimes(1);
      const cfg = createSpy.mock.calls[0][0];
      expect(cfg.headers.Authorization).toBeUndefined();
      expect(cfg.headers.Cookie).toBeUndefined();
      expect(cfg.baseURL).toBe(DEFAULT_API_URL);
    });

    test('sends Bearer + Cookie when token available from config', () => {
      writeConfig({ api_url: DEFAULT_API_URL, access_token: 'cfg-tok' });
      api.createClient();
      const cfg = createSpy.mock.calls[0][0];
      expect(cfg.headers.Authorization).toBe('Bearer cfg-tok');
      expect(cfg.headers.Cookie).toBe('access_token=cfg-tok');
    });

    test('explicit accessToken option overrides stored token', () => {
      writeConfig({ api_url: DEFAULT_API_URL, access_token: 'cfg-tok' });
      api.createClient({ accessToken: 'override' });
      const cfg = createSpy.mock.calls[0][0];
      expect(cfg.headers.Authorization).toBe('Bearer override');
      expect(cfg.headers.Cookie).toBe('access_token=override');
    });
  });

  describe('extractAccessTokenCookie', () => {
    test('returns null for missing header', () => {
      expect(api.extractAccessTokenCookie(undefined)).toBeNull();
      expect(api.extractAccessTokenCookie(null)).toBeNull();
    });
    test('parses cookie value from array', () => {
      const token = api.extractAccessTokenCookie([
        'refresh_token=abc; HttpOnly',
        'access_token=jwt-token-here; Path=/; HttpOnly',
      ]);
      expect(token).toBe('jwt-token-here');
    });
    test('parses cookie value from string', () => {
      const token = api.extractAccessTokenCookie('access_token=plain; Path=/');
      expect(token).toBe('plain');
    });
    test('returns null when cookie absent', () => {
      const token = api.extractAccessTokenCookie(['session=foo; Path=/']);
      expect(token).toBeNull();
    });
    test('url-decodes the value', () => {
      const token = api.extractAccessTokenCookie(['access_token=ab%20cd; Path=/']);
      expect(token).toBe('ab cd');
    });
  });

  describe('login', () => {
    test('returns access token on success', async () => {
      fakeClient.post.mockResolvedValueOnce({
        status: 200,
        headers: { 'set-cookie': ['access_token=tok-1; Path=/; HttpOnly'] },
        data: { user: { id: 'u1', email: 'a@b.c', displayName: 'A', role: 'freelancer' } },
      });

      const r = await api.login('a@b.c', 'pw');
      expect(r.accessToken).toBe('tok-1');
      expect(r.user.id).toBe('u1');
      expect(r.user.email).toBe('a@b.c');
      expect(fakeClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'a@b.c',
        password: 'pw',
      });
    });

    test('throws when response has no access_token cookie', async () => {
      fakeClient.post.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: { user: { id: 'u1', email: 'a@b.c' } },
      });
      await expect(api.login('a@b.c', 'pw')).rejects.toThrow(/access_token cookie/);
    });

    test('throws formatted error on 401', async () => {
      fakeClient.post.mockResolvedValueOnce({
        status: 401,
        headers: {},
        data: { message: 'Invalid credentials' },
      });
      await expect(api.login('a@b.c', 'pw')).rejects.toThrow(/Login failed.*401.*Invalid credentials/);
    });

    test('handles nested data.user envelope', async () => {
      fakeClient.post.mockResolvedValueOnce({
        status: 200,
        headers: { 'set-cookie': ['access_token=nested'] },
        data: { data: { user: { id: 'u2', email: 'n@e.s' } } },
      });
      const r = await api.login('n@e.s', 'pw');
      expect(r.user.id).toBe('u2');
      expect(r.accessToken).toBe('nested');
    });
  });

  describe('logout', () => {
    test('succeeds on 200', async () => {
      fakeClient.post.mockResolvedValueOnce({ status: 200, data: {} });
      await api.logout();
      expect(fakeClient.post).toHaveBeenCalledWith('/auth/logout');
    });
    test('tolerates 401 silently', async () => {
      fakeClient.post.mockResolvedValueOnce({ status: 401, data: {} });
      await expect(api.logout()).resolves.toBeUndefined();
    });
    test('throws on 500', async () => {
      fakeClient.post.mockResolvedValueOnce({
        status: 500,
        data: { message: 'kaboom' },
      });
      await expect(api.logout()).rejects.toThrow(/Logout failed.*500.*kaboom/);
    });
  });

  describe('getBidderAgent', () => {
    test('returns body on 200', async () => {
      fakeClient.get.mockResolvedValueOnce({
        status: 200,
        data: { id: 'a1', userId: 'u1', autoBidEnabled: true },
      });
      const a = await api.getBidderAgent();
      expect(a.id).toBe('a1');
      expect(fakeClient.get).toHaveBeenCalledWith('/bidder-agent/me');
    });
    test('throws on 404 with array body', async () => {
      fakeClient.get.mockResolvedValueOnce({ status: 404, data: ['nope', 'again'] });
      await expect(api.getBidderAgent()).rejects.toThrow(/404/);
    });
    test('throws on 500 with no body', async () => {
      fakeClient.get.mockResolvedValueOnce({ status: 500, data: null });
      await expect(api.getBidderAgent()).rejects.toThrow(/Failed to fetch bidder agent/);
    });
  });

  describe('updateBidderAgent', () => {
    test('sends PATCH and returns body', async () => {
      fakeClient.patch.mockResolvedValueOnce({
        status: 200,
        data: { id: 'a1', nlConfig: 'x' },
      });
      const a = await api.updateBidderAgent({ nlConfig: 'x' });
      expect(a.id).toBe('a1');
      expect(fakeClient.patch).toHaveBeenCalledWith('/bidder-agent/me', { nlConfig: 'x' });
    });
    test('throws on 400', async () => {
      fakeClient.patch.mockResolvedValueOnce({
        status: 400,
        data: { error: 'bad' },
      });
      await expect(api.updateBidderAgent({ nlConfig: 'x' })).rejects.toThrow(/400/);
    });
  });

  describe('internal helpers', () => {
    test('stripTrailingSlash leaves non-trailing untouched', () => {
      expect(api.__test__.stripTrailingSlash('http://x')).toBe('http://x');
      expect(api.__test__.stripTrailingSlash('http://x/')).toBe('http://x');
    });
    test('apiError formats array body via join', () => {
      const err = api.__test__.apiError(
        { status: 422, data: ['must be a string', 'must not be empty'] } as any,
        'Validation failed',
      );
      expect(err.message).toContain('422');
      expect(err.message).toContain('must be a string, must not be empty');
    });
    test('apiError falls back to the provided label when body has no usable text', () => {
      const err = api.__test__.apiError({ status: 500, data: { somethingElse: 1 } } as any, 'oops');
      expect(err.message).toContain('500');
      expect(err.message).toContain('oops');
    });
  });

  describe('submitDelivery', () => {
    test('encodes dispatch id and posts body', async () => {
      fakeClient.post.mockResolvedValueOnce({ status: 201, data: { id: 'd-1' } });
      const r = await api.submitDelivery('disp 1', { message: 'hi' });
      expect(r).toEqual({ id: 'd-1' });
      expect(fakeClient.post).toHaveBeenCalledWith('/dispatch/disp%201/deliver', {
        message: 'hi',
      });
    });
    test('throws on 403', async () => {
      fakeClient.post.mockResolvedValueOnce({
        status: 403,
        data: { message: 'not yours' },
      });
      await expect(api.submitDelivery('d', {})).rejects.toThrow(/403.*not yours/);
    });
  });
});
