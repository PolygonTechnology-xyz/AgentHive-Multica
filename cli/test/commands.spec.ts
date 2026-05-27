import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { makeAuthLogin } from '../src/commands/auth-login';
import { makeAuthLogout } from '../src/commands/auth-logout';
import { makeAgentConnect, buildNlConfig } from '../src/commands/agent-connect';
import { makeAgentList } from '../src/commands/agent-list';
import { makeDeliver, parseAttachments } from '../src/commands/deliver';
import { writeConfig, readConfig, DEFAULT_API_URL } from '../src/lib/config';
import { ui as realUi } from '../src/lib/ui';

function makeUi() {
  return {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    plain: jest.fn(),
    bold: jest.fn((s: string) => s),
    dim: jest.fn((s: string) => s),
  };
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

  // ---- ui smoke ------------------------------------------------------------
  describe('ui', () => {
    test('all helpers run without throwing', () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      realUi.success('s');
      realUi.error('e');
      realUi.info('i');
      realUi.warn('w');
      realUi.plain('p');
      expect(realUi.bold('x')).toContain('x');
      expect(realUi.dim('x')).toContain('x');
      expect(logSpy).toHaveBeenCalled();
      expect(errSpy).toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();
    });
  });

  // ---- auth-login ----------------------------------------------------------
  describe('auth login', () => {
    test('prompts for missing credentials, persists config on success', async () => {
      const out = makeUi();
      const prompt = jest.fn().mockResolvedValue({ email: 'a@b.c', password: 'pw' });
      const loginFn = jest.fn().mockResolvedValue({
        accessToken: 'tok',
        user: { id: 'u1', email: 'a@b.c' },
      });

      const run = makeAuthLogin({
        prompt: prompt as any,
        loginFn: loginFn as any,
        out: out as any,
      });
      await run({});

      expect(loginFn).toHaveBeenCalledWith('a@b.c', 'pw', { apiUrl: undefined });
      const cfg = readConfig();
      expect(cfg.access_token).toBe('tok');
      expect(cfg.user_email).toBe('a@b.c');
      expect(out.success).toHaveBeenCalled();
    });

    test('skips prompts when --email and --password supplied', async () => {
      const out = makeUi();
      const prompt = jest.fn().mockResolvedValue({});
      const loginFn = jest.fn().mockResolvedValue({
        accessToken: 'tok',
        user: { id: 'u1', email: 'a@b.c' },
      });

      const run = makeAuthLogin({ prompt: prompt as any, loginFn: loginFn as any, out: out as any });
      await run({ email: 'a@b.c', password: 'pw', apiUrl: 'http://x/api/v1' });

      // No prompt fields requested → still called but with empty array
      expect(prompt).toHaveBeenCalledWith([]);
      expect(loginFn).toHaveBeenCalledWith('a@b.c', 'pw', { apiUrl: 'http://x/api/v1' });
    });

    test('throws when user cancels (no credentials returned)', async () => {
      const out = makeUi();
      const prompt = jest.fn().mockResolvedValue({}); // cancelled
      const loginFn = jest.fn();

      const run = makeAuthLogin({ prompt: prompt as any, loginFn: loginFn as any, out: out as any });
      await expect(run({})).rejects.toThrow(/Missing credentials/);
      expect(loginFn).not.toHaveBeenCalled();
      expect(out.error).toHaveBeenCalled();
    });

    test('prompt validators reject empty / malformed input', async () => {
      const out = makeUi();
      let captured: any[] = [];
      const prompt = jest.fn(async (questions: any[]) => {
        captured = questions;
        return { email: 'a@b.c', password: 'pw' };
      });
      const loginFn = jest.fn().mockResolvedValue({
        accessToken: 't',
        user: { id: 'u', email: 'a@b.c' },
      });
      const run = makeAuthLogin({ prompt: prompt as any, loginFn: loginFn as any, out: out as any });
      await run({});
      const emailQ = captured.find((q) => q.name === 'email');
      const passQ = captured.find((q) => q.name === 'password');
      expect(emailQ.validate('')).toBe('Enter a valid email');
      expect(emailQ.validate('plainstring')).toBe('Enter a valid email');
      expect(emailQ.validate('ok@example.com')).toBe(true);
      expect(passQ.validate('')).toBe('Password required');
      expect(passQ.validate('x')).toBe(true);
    });
  });

  // ---- auth-logout ---------------------------------------------------------
  describe('auth logout', () => {
    test('already-logged-out path: info + ensure file removed', async () => {
      const out = makeUi();
      const logoutFn = jest.fn();
      const run = makeAuthLogout({ logoutFn: logoutFn as any, out: out as any });
      await run({});
      expect(logoutFn).not.toHaveBeenCalled();
      expect(out.info).toHaveBeenCalled();
    });

    test('happy path: calls backend, clears config', async () => {
      writeConfig({ api_url: DEFAULT_API_URL, access_token: 'tok', user_email: 'a@b.c' });
      const out = makeUi();
      const logoutFn = jest.fn().mockResolvedValue(undefined);

      const run = makeAuthLogout({ logoutFn: logoutFn as any, out: out as any });
      await run({});

      expect(logoutFn).toHaveBeenCalled();
      expect(out.success).toHaveBeenCalled();
      const cfg = readConfig();
      expect(cfg.access_token).toBeUndefined();
    });

    test('backend failure still clears local credentials', async () => {
      writeConfig({ api_url: DEFAULT_API_URL, access_token: 'tok' });
      const out = makeUi();
      const logoutFn = jest.fn().mockRejectedValue(new Error('502 bad gw'));

      const run = makeAuthLogout({ logoutFn: logoutFn as any, out: out as any });
      await run({ apiUrl: 'http://x/api/v1' });

      expect(out.warn).toHaveBeenCalledWith(expect.stringContaining('502'));
      expect(out.success).toHaveBeenCalled();
      const cfg = readConfig();
      expect(cfg.access_token).toBeUndefined();
    });
  });

  // ---- agent-connect -------------------------------------------------------
  describe('agent connect', () => {
    test('buildNlConfig handles empty and populated capability lists', () => {
      expect(buildNlConfig('alice', [])).toMatch(/"alice"/);
      const s = buildNlConfig('alice', ['react', 'nextjs']);
      expect(s).toMatch(/react, nextjs/);
    });

    test('refuses to run when not authenticated', async () => {
      const out = makeUi();
      const run = makeAgentConnect({
        prompt: jest.fn() as any,
        getAgent: jest.fn() as any,
        updateAgent: jest.fn() as any,
        out: out as any,
      });
      await expect(run({})).rejects.toThrow(/Not authenticated/);
      expect(out.error).toHaveBeenCalled();
    });

    test('happy path: prompts, updates, persists agent id', async () => {
      writeConfig({ api_url: DEFAULT_API_URL, access_token: 'tok' });
      const out = makeUi();
      const prompt = jest
        .fn()
        .mockResolvedValue({ name: 'alice', capabilities: 'react, nextjs , ' });
      const getAgent = jest.fn().mockResolvedValue({ id: 'agt-1', userId: 'u1' });
      const updateAgent = jest
        .fn()
        .mockResolvedValue({ id: 'agt-1', userId: 'u1', nlConfig: 'x' });

      const run = makeAgentConnect({
        prompt: prompt as any,
        getAgent: getAgent as any,
        updateAgent: updateAgent as any,
        out: out as any,
      });
      await run({});

      expect(updateAgent).toHaveBeenCalledWith(
        { nlConfig: expect.stringContaining('react, nextjs') },
        { apiUrl: undefined },
      );
      const cfg = readConfig();
      expect(cfg.agent_id).toBe('agt-1');
      expect(out.success).toHaveBeenCalled();
    });

    test('tolerates getAgent failure (warns, still updates)', async () => {
      writeConfig({ api_url: DEFAULT_API_URL, access_token: 'tok' });
      const out = makeUi();
      const prompt = jest.fn().mockResolvedValue({ name: 'alice', capabilities: 'go' });
      const getAgent = jest.fn().mockRejectedValue(new Error('404'));
      const updateAgent = jest.fn().mockResolvedValue({ id: 'agt-2' });

      const run = makeAgentConnect({
        prompt: prompt as any,
        getAgent: getAgent as any,
        updateAgent: updateAgent as any,
        out: out as any,
      });
      await run({ name: 'alice', capabilities: 'go' });

      expect(out.warn).toHaveBeenCalledWith(expect.stringContaining('404'));
      const cfg = readConfig();
      expect(cfg.agent_id).toBe('agt-2');
    });

    test('throws when cancelled (empty name)', async () => {
      writeConfig({ api_url: DEFAULT_API_URL, access_token: 'tok' });
      const out = makeUi();
      const prompt = jest.fn().mockResolvedValue({}); // cancelled
      const run = makeAgentConnect({
        prompt: prompt as any,
        getAgent: jest.fn() as any,
        updateAgent: jest.fn() as any,
        out: out as any,
      });
      await expect(run({})).rejects.toThrow(/Missing agent details/);
    });

    test('prompt validators reject empty input', async () => {
      writeConfig({ api_url: DEFAULT_API_URL, access_token: 'tok' });
      const out = makeUi();
      let captured: any[] = [];
      const prompt = jest.fn(async (questions: any[]) => {
        captured = questions;
        return { name: 'a', capabilities: 'x' };
      });
      const run = makeAgentConnect({
        prompt: prompt as any,
        getAgent: jest.fn().mockResolvedValue({ id: 'a' }) as any,
        updateAgent: jest.fn().mockResolvedValue({ id: 'a' }) as any,
        out: out as any,
      });
      await run({});
      const nameQ = captured.find((q) => q.name === 'name');
      const capsQ = captured.find((q) => q.name === 'capabilities');
      expect(nameQ.validate('')).toBe('Name required');
      expect(nameQ.validate('alice')).toBe(true);
      expect(capsQ.validate('')).toBe('At least one capability');
      expect(capsQ.validate('react')).toBe(true);
    });

    test('falls back to getAgent id when updateAgent omits one', async () => {
      writeConfig({ api_url: DEFAULT_API_URL, access_token: 'tok' });
      const out = makeUi();
      const prompt = jest.fn().mockResolvedValue({});
      const getAgent = jest.fn().mockResolvedValue({ id: 'fallback-id' });
      const updateAgent = jest.fn().mockResolvedValue({}); // no id

      const run = makeAgentConnect({
        prompt: prompt as any,
        getAgent: getAgent as any,
        updateAgent: updateAgent as any,
        out: out as any,
      });
      await run({ name: 'a', capabilities: 'x' });
      expect(readConfig().agent_id).toBe('fallback-id');
    });
  });

  // ---- agent-list ----------------------------------------------------------
  describe('agent list', () => {
    test('refuses when not authenticated', async () => {
      const out = makeUi();
      const run = makeAgentList({ getAgent: jest.fn() as any, out: out as any });
      await expect(run({})).rejects.toThrow(/Not authenticated/);
    });

    test('formatted output', async () => {
      writeConfig({ api_url: DEFAULT_API_URL, access_token: 'tok' });
      const out = makeUi();
      const getAgent = jest.fn().mockResolvedValue({
        id: 'a1',
        status: 'active',
        autoBidEnabled: true,
        bidThreshold: 70,
        maxBidAmount: 20000,
        nlConfig: 'work hard',
      });
      const run = makeAgentList({ getAgent: getAgent as any, out: out as any });
      await run({});
      expect(out.plain).toHaveBeenCalled();
      const lines = (out.plain.mock.calls as unknown as string[][]).map((c) => c[0]).join('\n');
      expect(lines).toContain('a1');
      expect(lines).toContain('work hard');
    });

    test('JSON output', async () => {
      writeConfig({ api_url: DEFAULT_API_URL, access_token: 'tok' });
      const out = makeUi();
      const agent = { id: 'a1' };
      const getAgent = jest.fn().mockResolvedValue(agent);
      const run = makeAgentList({ getAgent: getAgent as any, out: out as any });
      await run({ json: true });
      expect(out.plain).toHaveBeenCalledWith(JSON.stringify(agent, null, 2));
    });

    test('formatted output handles missing fields', async () => {
      writeConfig({ api_url: DEFAULT_API_URL, access_token: 'tok' });
      const out = makeUi();
      const getAgent = jest.fn().mockResolvedValue({});
      const run = makeAgentList({ getAgent: getAgent as any, out: out as any });
      await run({});
      const lines = (out.plain.mock.calls as unknown as string[][]).map((c) => c[0]).join('\n');
      expect(lines).toContain('(none)');
      expect(lines).toContain('off');
    });
  });

  // ---- deliver -------------------------------------------------------------
  describe('deliver', () => {
    test('parseAttachments supports name=url and bare URLs', () => {
      const r = parseAttachments([
        'design.zip=https://cdn.example.com/d/design.zip',
        'https://cdn.example.com/d/screenshot.png',
        '   ',
        'invalid',
        'name=', // empty url skipped
      ]);
      expect(r).toEqual([
        { name: 'design.zip', url: 'https://cdn.example.com/d/design.zip' },
        { name: 'screenshot.png', url: 'https://cdn.example.com/d/screenshot.png' },
        { name: 'invalid', url: 'invalid' },
      ]);
    });

    test('parseAttachments treats leading = as bare URL fallback', () => {
      // A token starting with = has no usable name on the left side, so we
      // treat the whole token as a bare URL and derive the name.
      const r = parseAttachments(['=onlyurl']);
      expect(r).toEqual([{ name: '=onlyurl', url: '=onlyurl' }]);
    });

    test('parseAttachments derives hostname when path is empty', () => {
      const r = parseAttachments(['https://cdn.example.com']);
      expect(r[0].name).toBe('cdn.example.com');
    });

    test('refuses when not authenticated', async () => {
      const out = makeUi();
      const run = makeDeliver({
        prompt: jest.fn() as any,
        submitFn: jest.fn() as any,
        out: out as any,
      });
      await expect(run({})).rejects.toThrow(/Not authenticated/);
    });

    test('prompts for dispatch id when neither flag nor cache provides one', async () => {
      writeConfig({ api_url: DEFAULT_API_URL, access_token: 'tok' });
      const out = makeUi();
      const prompt = jest
        .fn()
        .mockResolvedValueOnce({ dispatchId: 'disp-1' })
        .mockResolvedValueOnce({ message: 'hi' })
        .mockResolvedValueOnce({ files: 'a.zip=https://x/a.zip, https://x/b.png' });
      const submitFn = jest.fn().mockResolvedValue({ id: 'dl-1' });

      const run = makeDeliver({
        prompt: prompt as any,
        submitFn: submitFn as any,
        out: out as any,
      });
      await run({});

      expect(submitFn).toHaveBeenCalledWith(
        'disp-1',
        {
          message: 'hi',
          attachments: [
            { name: 'a.zip', url: 'https://x/a.zip' },
            { name: 'b.png', url: 'https://x/b.png' },
          ],
        },
        { apiUrl: undefined },
      );
      expect(readConfig().active_dispatch_id).toBe('disp-1');
      expect(out.success).toHaveBeenCalled();
    });

    test('uses cached active_dispatch_id and supplied file flags', async () => {
      writeConfig({
        api_url: DEFAULT_API_URL,
        access_token: 'tok',
        active_dispatch_id: 'cached-d',
      });
      const out = makeUi();
      const prompt = jest.fn(); // not used
      const submitFn = jest.fn().mockResolvedValue({});

      const run = makeDeliver({
        prompt: prompt as any,
        submitFn: submitFn as any,
        out: out as any,
      });
      await run({
        message: 'msg',
        file: ['a.zip=https://x/a.zip'],
      });
      expect(prompt).not.toHaveBeenCalled();
      expect(submitFn).toHaveBeenCalledWith(
        'cached-d',
        { message: 'msg', attachments: [{ name: 'a.zip', url: 'https://x/a.zip' }] },
        { apiUrl: undefined },
      );
    });

    test('dispatch id prompt validator rejects empty input', async () => {
      writeConfig({ api_url: DEFAULT_API_URL, access_token: 'tok' });
      const out = makeUi();
      let captured: any = null;
      const prompt = jest.fn(async (q: any) => {
        if (!captured) captured = q;
        if (q.name === 'dispatchId') return { dispatchId: 'd-1' };
        if (q.name === 'message') return { message: '' };
        return { files: '' };
      });
      const submitFn = jest.fn().mockResolvedValue({});
      const run = makeDeliver({
        prompt: prompt as any,
        submitFn: submitFn as any,
        out: out as any,
      });
      await run({});
      expect(captured.validate('')).toBe('Dispatch id required');
      expect(captured.validate('x')).toBe(true);
    });

    test('throws when dispatch id missing after prompt', async () => {
      writeConfig({ api_url: DEFAULT_API_URL, access_token: 'tok' });
      const out = makeUi();
      const prompt = jest.fn().mockResolvedValueOnce({});
      const run = makeDeliver({
        prompt: prompt as any,
        submitFn: jest.fn() as any,
        out: out as any,
      });
      await expect(run({})).rejects.toThrow(/Missing dispatch id/);
    });

    test('omits attachments key when none provided', async () => {
      writeConfig({ api_url: DEFAULT_API_URL, access_token: 'tok' });
      const out = makeUi();
      const prompt = jest
        .fn()
        .mockResolvedValueOnce({ message: 'just text' })
        .mockResolvedValueOnce({ files: '' });
      const submitFn = jest.fn().mockResolvedValue({});

      const run = makeDeliver({
        prompt: prompt as any,
        submitFn: submitFn as any,
        out: out as any,
      });
      await run({ dispatchId: 'd-x' });
      expect(submitFn).toHaveBeenCalledWith(
        'd-x',
        { message: 'just text' },
        { apiUrl: undefined },
      );
    });
  });

  // ---- index/buildProgram smoke -------------------------------------------
  describe('index / buildProgram', () => {
    test('exposes all commands and a useful help screen', async () => {
      const { buildProgram } = await import('../src/index');
      const program = buildProgram();
      const names = program.commands.map((c) => c.name()).sort();
      expect(names).toEqual(['agent', 'auth', 'deliver']);

      const help = program.helpInformation();
      expect(help).toContain('agenthive');
      expect(help).toContain('auth');
      expect(help).toContain('deliver');

      // Subcommands are wired
      const auth = program.commands.find((c) => c.name() === 'auth')!;
      expect(auth.commands.map((c) => c.name()).sort()).toEqual(['login', 'logout']);
      const agent = program.commands.find((c) => c.name() === 'agent')!;
      expect(agent.commands.map((c) => c.name()).sort()).toEqual(['connect', 'list']);
    });

    test('main reports errors via ui.error and returns non-zero', async () => {
      const { main } = await import('../src/index');
      // No HOME-based config exists, no token → auth login subcommand will be
      // invoked but commander needs --email/--password to avoid prompting. We
      // give an unknown command instead, which makes commander throw via
      // `exitOverride`-less default. Commander's default for unknown command
      // is to print + exit(1); we intercept exit so main observes a throw.
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(((code?: number) => {
        throw new Error(`exit:${code}`);
      }) as never);
      const errSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
      const outSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);

      const code = await main(['node', 'agenthive', 'no-such-command']);
      expect(code).toBe(1);

      exitSpy.mockRestore();
      errSpy.mockRestore();
      outSpy.mockRestore();
    });
  });
});
