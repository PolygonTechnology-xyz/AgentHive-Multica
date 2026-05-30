import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { makeAuthLogin } from '../src/commands/auth-login';
import { makeAuthLogout } from '../src/commands/auth-logout';
import { makeAgentConnect, parseCapabilities } from '../src/commands/agent-connect';
import { makeAgentList } from '../src/commands/agent-list';
import { makeAgentDeactivate } from '../src/commands/agent-deactivate';
import { makeAgentRemove } from '../src/commands/agent-remove';
import { makeDeliver, parseAttachments } from '../src/commands/deliver';
import { writeConfig, readConfig, DEFAULT_API_URL } from '../src/lib/config';

function makeUi() {
  return { success: jest.fn(), error: jest.fn(), info: jest.fn(), warn: jest.fn(), plain: jest.fn(), bold: jest.fn((s: string) => s), dim: jest.fn((s: string) => s) };
}

describe('commands', () => {
  let tmpHome: string;
  const realHome = process.env.HOME;

  beforeEach(() => {
    tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'agenthive-cli-cmd-'));
    process.env.HOME = tmpHome;
    delete process.env.AGENTHIVE_API_URL;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.HOME = realHome;
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  test('auth login prompts and persists token', async () => {
    const out = makeUi();
    const prompt = jest.fn().mockResolvedValue({ email: 'a@b.c', password: 'pw' });
    const loginFn = jest.fn().mockResolvedValue({ accessToken: 'tok', user: { id: 'u1', email: 'a@b.c' } });
    await makeAuthLogin({ prompt: prompt as any, loginFn: loginFn as any, out: out as any })({});
    expect(readConfig().access_token).toBe('tok');
    expect(out.success).toHaveBeenCalled();
  });

  test('auth login rejects missing credentials', async () => {
    const out = makeUi();
    await expect(makeAuthLogin({ prompt: jest.fn().mockResolvedValue({}) as any, loginFn: jest.fn() as any, out: out as any })({})).rejects.toThrow(/Missing credentials/);
  });

  test('auth logout clears local credentials and tolerates backend failure', async () => {
    writeConfig({ api_url: DEFAULT_API_URL, access_token: 'tok' });
    const out = makeUi();
    await makeAuthLogout({ logoutFn: jest.fn().mockRejectedValue(new Error('offline')) as any, out: out as any })({});
    expect(readConfig().access_token).toBeUndefined();
    expect(out.warn).toHaveBeenCalled();
  });

  test('agent connect creates Workforce Agent and prints id/status', async () => {
    writeConfig({ api_url: DEFAULT_API_URL, access_token: 'tok' });
    const out = makeUi();
    const createAgent = jest.fn().mockResolvedValue({ id: 'a1', name: 'alice', status: 'ACTIVE', skillIndex: ['react'] });
    await makeAgentConnect({ createAgent: createAgent as any, out: out as any })({ name: 'alice', capabilities: 'react, nextjs' });
    expect(createAgent).toHaveBeenCalledWith({ name: 'alice', skills: ['react', 'nextjs'] }, { apiUrl: undefined });
    expect(out.info).toHaveBeenCalledWith('Status: ACTIVE');
  });

  test('agent connect prompts, validates, and rejects missing auth/details', async () => {
    expect(parseCapabilities(' react, ,ts ')).toEqual(['react', 'ts']);
    const out = makeUi();
    await expect(makeAgentConnect({ prompt: jest.fn() as any, createAgent: jest.fn() as any, out: out as any })({})).rejects.toThrow(/Not authenticated/);
    writeConfig({ api_url: DEFAULT_API_URL, access_token: 'tok' });
    await expect(makeAgentConnect({ prompt: jest.fn().mockResolvedValue({}) as any, createAgent: jest.fn() as any, out: out as any })({})).rejects.toThrow(/Missing agent details/);
  });

  test('agent list renders table and JSON', async () => {
    writeConfig({ api_url: DEFAULT_API_URL, access_token: 'tok' });
    const out = makeUi();
    const agents = [{ id: 'a1', name: 'alpha', status: 'ACTIVE', skillIndex: ['ts'] }];
    const listAgents = jest.fn().mockResolvedValue(agents);
    const run = makeAgentList({ listAgents: listAgents as any, out: out as any });
    await run({});
    expect(out.plain).toHaveBeenCalledWith('a1 | alpha | ACTIVE | ts');
    await run({ json: true });
    expect(out.plain).toHaveBeenCalledWith(JSON.stringify(agents, null, 2));
  });

  test('agent deactivate calls PATCH endpoint wrapper', async () => {
    writeConfig({ api_url: DEFAULT_API_URL, access_token: 'tok' });
    const out = makeUi();
    const deactivateAgent = jest.fn().mockResolvedValue({ id: 'a1' });
    await makeAgentDeactivate({ deactivateAgent: deactivateAgent as any, out: out as any })('a1', {});
    expect(deactivateAgent).toHaveBeenCalledWith('a1', { apiUrl: undefined });
  });

  test('agent remove confirms unless --yes is set', async () => {
    writeConfig({ api_url: DEFAULT_API_URL, access_token: 'tok' });
    const out = makeUi();
    const removeAgent = jest.fn().mockResolvedValue({ id: 'a1' });
    await makeAgentRemove({ removeAgent: removeAgent as any, out: out as any })('a1', { yes: true });
    expect(removeAgent).toHaveBeenCalledWith('a1', { apiUrl: undefined });
    await expect(makeAgentRemove({ prompt: jest.fn().mockResolvedValue({ confirmed: false }) as any, removeAgent: removeAgent as any, out: out as any })('a2', {})).rejects.toThrow(/cancelled/i);
  });

  test('deliver parses attachments and submits payload', async () => {
    expect(parseAttachments(['x=https://e.test/x', 'https://e.test/y.png'])[0]).toEqual({ name: 'x', url: 'https://e.test/x' });
    writeConfig({ api_url: DEFAULT_API_URL, access_token: 'tok', active_dispatch_id: 'd1' });
    const submitFn = jest.fn().mockResolvedValue({ ok: true });
    await makeDeliver({ prompt: jest.fn().mockResolvedValue({}) as any, submitFn: submitFn as any, out: makeUi() as any })({ message: 'done' });
    expect(submitFn).toHaveBeenCalledWith('d1', { message: 'done' }, { apiUrl: undefined });
  });
});
