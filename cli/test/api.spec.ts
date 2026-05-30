import axios from 'axios';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as api from '../src/lib/api';
import { writeConfig, DEFAULT_API_URL } from '../src/lib/config';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

interface FakeClient { post: jest.Mock; get: jest.Mock; patch: jest.Mock; delete: jest.Mock }
const makeFakeClient = (): FakeClient => ({ post: jest.fn(), get: jest.fn(), patch: jest.fn(), delete: jest.fn() });

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

  test('resolveApiUrl precedence and trimming', () => {
    expect(api.resolveApiUrl('http://x.com/api/v1/')).toBe('http://x.com/api/v1');
    process.env.AGENTHIVE_API_URL = 'http://env.test/api/v1/';
    expect(api.resolveApiUrl()).toBe('http://env.test/api/v1');
    delete process.env.AGENTHIVE_API_URL;
    writeConfig({ api_url: 'http://cfg.test/api/v1' });
    expect(api.resolveApiUrl()).toBe('http://cfg.test/api/v1');
  });

  test('createClient uses bearer-only auth header', () => {
    writeConfig({ api_url: DEFAULT_API_URL, access_token: 'cfg-tok' });
    api.createClient({ accessToken: 'override' });
    const cfg = createSpy.mock.calls[0][0];
    expect(cfg.headers.Authorization).toBe('Bearer override');
    expect(cfg.headers.Cookie).toBeUndefined();
  });

  test('login reads accessToken from response body', async () => {
    fakeClient.post.mockResolvedValueOnce({ status: 200, data: { accessToken: 'tok', expiresIn: 900, user: { id: 'u1', email: 'a@b.c' } } });
    const result = await api.login('a@b.c', 'pw');
    expect(result.accessToken).toBe('tok');
    expect(result.expiresIn).toBe(900);
    expect(fakeClient.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.c', password: 'pw' });
  });

  test('login supports transform response envelope and errors without accessToken', async () => {
    fakeClient.post.mockResolvedValueOnce({ status: 200, data: { data: { accessToken: 'nested', user: { id: 'u2', email: 'n@e.s' } } } });
    await expect(api.login('n@e.s', 'pw')).resolves.toMatchObject({ accessToken: 'nested' });
    fakeClient.post.mockResolvedValueOnce({ status: 200, data: { user: { id: 'u1' } } });
    await expect(api.login('a@b.c', 'pw')).rejects.toThrow(/accessToken/);
  });

  test('logout tolerates 401 and throws other failures', async () => {
    fakeClient.post.mockResolvedValueOnce({ status: 401, data: {} });
    await expect(api.logout()).resolves.toBeUndefined();
    fakeClient.post.mockResolvedValueOnce({ status: 500, data: { message: 'kaboom' } });
    await expect(api.logout()).rejects.toThrow(/Logout failed.*500.*kaboom/);
  });

  test('workforce agent API calls expected endpoints', async () => {
    fakeClient.post.mockResolvedValueOnce({ status: 201, data: { id: 'a1', name: 'n', status: 'ACTIVE' } });
    await expect(api.createWorkforceAgent({ name: 'n', skills: ['ts'] })).resolves.toMatchObject({ id: 'a1' });
    expect(fakeClient.post).toHaveBeenCalledWith('/workforce-agents', { name: 'n', skills: ['ts'] });

    fakeClient.get.mockResolvedValueOnce({ status: 200, data: [{ id: 'a1' }] });
    await expect(api.listWorkforceAgents()).resolves.toEqual([{ id: 'a1' }]);
    expect(fakeClient.get).toHaveBeenCalledWith('/workforce-agents');

    fakeClient.patch.mockResolvedValueOnce({ status: 200, data: { id: 'a1', status: 'INACTIVE' } });
    await api.deactivateWorkforceAgent('a 1');
    expect(fakeClient.patch).toHaveBeenCalledWith('/workforce-agents/a%201/deactivate');

    fakeClient.delete.mockResolvedValueOnce({ status: 200, data: { id: 'a1', status: 'REMOVED' } });
    await api.removeWorkforceAgent('a 1');
    expect(fakeClient.delete).toHaveBeenCalledWith('/workforce-agents/a%201');
  });

  test('submitDelivery encodes dispatch id and apiError formats array bodies', async () => {
    fakeClient.post.mockResolvedValueOnce({ status: 201, data: { id: 'd-1' } });
    await expect(api.submitDelivery('disp 1', { message: 'hi' })).resolves.toEqual({ id: 'd-1' });
    const err = api.__test__.apiError({ status: 422, data: ['bad', 'worse'] } as any, 'Validation failed');
    expect(err.message).toContain('bad, worse');
  });
});
