import * as api from '../lib/api';
import { readConfig } from '../lib/config';
import { ui } from '../lib/ui';

export interface AgentListOptions {
  apiUrl?: string;
  json?: boolean;
}

export interface AgentListDeps {
  listAgents?: typeof api.listWorkforceAgents;
  readCfg?: typeof readConfig;
  out?: typeof ui;
}

export function makeAgentList(deps: AgentListDeps = {}) {
  const listAgents = deps.listAgents ?? api.listWorkforceAgents;
  const readCfg = deps.readCfg ?? readConfig;
  const out = deps.out ?? ui;

  return async function run(opts: AgentListOptions = {}): Promise<void> {
    const cfg = readCfg();
    if (!cfg.access_token) {
      out.error('Not logged in. Run `agenthive auth login` first.');
      throw new Error('Not authenticated');
    }

    const agents = await listAgents({ apiUrl: opts.apiUrl });

    if (opts.json) {
      out.plain(JSON.stringify(agents, null, 2));
      return;
    }

    out.plain('id | name | status | skills');
    for (const agent of agents) {
      const skills = agent.skillIndex ?? agent.skills ?? [];
      out.plain(`${agent.id} | ${agent.name} | ${agent.status} | ${skills.join(', ')}`);
    }
  };
}

export const agentList = makeAgentList();
