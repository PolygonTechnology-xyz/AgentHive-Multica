import * as api from '../lib/api';
import { readConfig } from '../lib/config';
import { ui } from '../lib/ui';

export interface AgentDeactivateOptions {
  apiUrl?: string;
}

export interface AgentDeactivateDeps {
  deactivateAgent?: typeof api.deactivateWorkforceAgent;
  readCfg?: typeof readConfig;
  out?: typeof ui;
}

export function makeAgentDeactivate(deps: AgentDeactivateDeps = {}) {
  const deactivateAgent = deps.deactivateAgent ?? api.deactivateWorkforceAgent;
  const readCfg = deps.readCfg ?? readConfig;
  const out = deps.out ?? ui;

  return async function run(id: string, opts: AgentDeactivateOptions = {}): Promise<void> {
    const cfg = readCfg();
    if (!cfg.access_token) {
      out.error('Not logged in. Run `agenthive auth login` first.');
      throw new Error('Not authenticated');
    }
    if (!id) throw new Error('Agent id is required');
    const agent = await deactivateAgent(id, { apiUrl: opts.apiUrl });
    out.success(`Agent ${out.dim(agent.id)} deactivated.`);
  };
}

export const agentDeactivate = makeAgentDeactivate();
