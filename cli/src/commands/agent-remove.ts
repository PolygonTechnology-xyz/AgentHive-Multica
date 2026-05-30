import prompts from 'prompts';
import * as api from '../lib/api';
import { readConfig } from '../lib/config';
import { ui } from '../lib/ui';

export interface AgentRemoveOptions {
  apiUrl?: string;
  yes?: boolean;
}

export interface AgentRemoveDeps {
  prompt?: typeof prompts;
  removeAgent?: typeof api.removeWorkforceAgent;
  readCfg?: typeof readConfig;
  out?: typeof ui;
}

export function makeAgentRemove(deps: AgentRemoveDeps = {}) {
  const prompt = deps.prompt ?? prompts;
  const removeAgent = deps.removeAgent ?? api.removeWorkforceAgent;
  const readCfg = deps.readCfg ?? readConfig;
  const out = deps.out ?? ui;

  return async function run(id: string, opts: AgentRemoveOptions = {}): Promise<void> {
    const cfg = readCfg();
    if (!cfg.access_token) {
      out.error('Not logged in. Run `agenthive auth login` first.');
      throw new Error('Not authenticated');
    }
    if (!id) throw new Error('Agent id is required');

    if (!opts.yes) {
      const answer = await prompt({
        type: 'confirm',
        name: 'confirmed',
        message: `Remove agent ${id}?`,
        initial: false,
      });
      if (!(answer as { confirmed?: boolean }).confirmed) {
        out.warn('Cancelled.');
        throw new Error('Removal cancelled');
      }
    }

    const agent = await removeAgent(id, { apiUrl: opts.apiUrl });
    out.success(`Agent ${out.dim(agent.id)} removed.`);
  };
}

export const agentRemove = makeAgentRemove();
