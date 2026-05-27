import * as api from '../lib/api';
import { clearConfig, readConfig } from '../lib/config';
import { ui } from '../lib/ui';

export interface AuthLogoutOptions {
  apiUrl?: string;
}

export interface AuthLogoutDeps {
  logoutFn?: typeof api.logout;
  clear?: typeof clearConfig;
  read?: typeof readConfig;
  out?: typeof ui;
}

export function makeAuthLogout(deps: AuthLogoutDeps = {}) {
  const logoutFn = deps.logoutFn ?? api.logout;
  const clear = deps.clear ?? clearConfig;
  const read = deps.read ?? readConfig;
  const out = deps.out ?? ui;

  return async function run(opts: AuthLogoutOptions = {}): Promise<void> {
    const cfg = read();
    if (!cfg.access_token) {
      out.info('Already logged out.');
      // Make sure file is gone either way.
      clear();
      return;
    }

    try {
      await logoutFn({ apiUrl: opts.apiUrl });
    } catch (err) {
      // Best-effort: clear local state even if backend rejects.
      out.warn(`Backend logout failed: ${(err as Error).message}`);
    }

    clear();
    out.success('Logged out. Local credentials cleared.');
  };
}

export const authLogout = makeAuthLogout();
