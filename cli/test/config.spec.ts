import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  configDir,
  configPath,
  ensureConfigDir,
  readConfig,
  writeConfig,
  clearConfig,
  updateConfig,
  DEFAULT_API_URL,
} from '../src/lib/config';

describe('config', () => {
  let tmpHome: string;
  const realHome = process.env.HOME;

  beforeEach(() => {
    tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'agenthive-cli-'));
    process.env.HOME = tmpHome;
    delete process.env.AGENTHIVE_API_URL;
  });

  afterEach(() => {
    process.env.HOME = realHome;
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  test('configDir / configPath compose under HOME', () => {
    expect(configDir()).toBe(path.join(tmpHome, '.agenthive'));
    expect(configPath()).toBe(path.join(tmpHome, '.agenthive', 'config.json'));
  });

  test('readConfig returns defaults when no file present', () => {
    const cfg = readConfig();
    expect(cfg.api_url).toBe(DEFAULT_API_URL);
    expect(cfg.access_token).toBeUndefined();
  });

  test('readConfig honors AGENTHIVE_API_URL when no file present', () => {
    process.env.AGENTHIVE_API_URL = 'http://staging.example.com/api/v1';
    expect(readConfig().api_url).toBe('http://staging.example.com/api/v1');
  });

  test('ensureConfigDir is idempotent', () => {
    ensureConfigDir();
    ensureConfigDir();
    expect(fs.existsSync(configDir())).toBe(true);
  });

  test('writeConfig + readConfig roundtrip', () => {
    writeConfig({
      api_url: 'http://localhost:3001/api/v1',
      access_token: 'tok',
      user_email: 'a@b.c',
      user_id: 'u1',
      agent_id: 'a1',
      active_dispatch_id: 'd1',
    });

    const cfg = readConfig();
    expect(cfg.access_token).toBe('tok');
    expect(cfg.user_email).toBe('a@b.c');
    expect(cfg.user_id).toBe('u1');
    expect(cfg.agent_id).toBe('a1');
    expect(cfg.active_dispatch_id).toBe('d1');

    const stat = fs.statSync(configPath());
    // owner-only on POSIX (mode masks platform-specific high bits)
    expect((stat.mode & 0o777) & 0o077).toBe(0);
  });

  test('readConfig recovers from corrupt JSON', () => {
    ensureConfigDir();
    fs.writeFileSync(configPath(), 'this is not json {{{');
    const cfg = readConfig();
    expect(cfg.api_url).toBe(DEFAULT_API_URL);
    expect(cfg.access_token).toBeUndefined();
  });

  test('readConfig falls back when api_url missing in file', () => {
    ensureConfigDir();
    fs.writeFileSync(configPath(), JSON.stringify({ access_token: 'xyz' }));
    const cfg = readConfig();
    expect(cfg.api_url).toBe(DEFAULT_API_URL);
    expect(cfg.access_token).toBe('xyz');
  });

  test('clearConfig removes the file (and is safe when absent)', () => {
    writeConfig({ api_url: DEFAULT_API_URL, access_token: 'tok' });
    expect(fs.existsSync(configPath())).toBe(true);

    clearConfig();
    expect(fs.existsSync(configPath())).toBe(false);

    // No throw on second call
    clearConfig();
  });

  test('updateConfig merges patch into existing config', () => {
    writeConfig({ api_url: DEFAULT_API_URL, access_token: 'tok', user_email: 'a@b.c' });
    const updated = updateConfig({ agent_id: 'agt-1' });
    expect(updated.agent_id).toBe('agt-1');
    expect(updated.access_token).toBe('tok');
    expect(updated.user_email).toBe('a@b.c');
  });
});
