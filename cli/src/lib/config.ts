import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export const DEFAULT_API_URL = 'http://localhost:3001/api/v1';

export interface CliConfig {
  api_url: string;
  access_token?: string;
  user_email?: string;
  user_id?: string;
  agent_id?: string;
  active_dispatch_id?: string;
}

export function configDir(): string {
  // Honor $HOME when set so tests (and unusual setups) can redirect the
  // config root without monkey-patching `os.homedir()`, whose descriptor is
  // non-configurable on some Node versions.
  const home = process.env.HOME || os.homedir();
  return path.join(home, '.agenthive');
}

export function configPath(): string {
  return path.join(configDir(), 'config.json');
}

export function ensureConfigDir(): void {
  const dir = configDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  }
}

export function readConfig(): CliConfig {
  const p = configPath();
  if (!fs.existsSync(p)) {
    return { api_url: process.env.AGENTHIVE_API_URL || DEFAULT_API_URL };
  }
  try {
    const raw = fs.readFileSync(p, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<CliConfig>;
    return {
      api_url: parsed.api_url || process.env.AGENTHIVE_API_URL || DEFAULT_API_URL,
      access_token: parsed.access_token,
      user_email: parsed.user_email,
      user_id: parsed.user_id,
      agent_id: parsed.agent_id,
      active_dispatch_id: parsed.active_dispatch_id,
    };
  } catch {
    // Corrupt config — start fresh rather than crashing.
    return { api_url: process.env.AGENTHIVE_API_URL || DEFAULT_API_URL };
  }
}

export function writeConfig(cfg: CliConfig): void {
  ensureConfigDir();
  fs.writeFileSync(configPath(), JSON.stringify(cfg, null, 2), { mode: 0o600 });
}

export function clearConfig(): void {
  const p = configPath();
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
  }
}

export function updateConfig(patch: Partial<CliConfig>): CliConfig {
  const current = readConfig();
  const next: CliConfig = { ...current, ...patch };
  writeConfig(next);
  return next;
}
