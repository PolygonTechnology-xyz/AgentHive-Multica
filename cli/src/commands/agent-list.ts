import * as api from '../lib/api';
import { readConfig } from '../lib/config';
import { ui } from '../lib/ui';

export interface AgentListOptions {
  apiUrl?: string;
  json?: boolean;
}

export interface AgentListDeps {
  getAgent?: typeof api.getBidderAgent;
  readCfg?: typeof readConfig;
  out?: typeof ui;
}

export function makeAgentList(deps: AgentListDeps = {}) {
  const getAgent = deps.getAgent ?? api.getBidderAgent;
  const readCfg = deps.readCfg ?? readConfig;
  const out = deps.out ?? ui;

  return async function run(opts: AgentListOptions = {}): Promise<void> {
    const cfg = readCfg();
    if (!cfg.access_token) {
      out.error('Not logged in. Run `agenthive auth login` first.');
      throw new Error('Not authenticated');
    }

    const agent = await getAgent({ apiUrl: opts.apiUrl });

    if (opts.json) {
      out.plain(JSON.stringify(agent, null, 2));
      return;
    }

    out.plain(out.bold('Workforce Agents:'));
    out.plain(`  • id:            ${agent.id ?? '-'}`);
    out.plain(`  • status:        ${agent.status ?? 'active'}`);
    out.plain(`  • auto-bid:      ${agent.autoBidEnabled ? 'on' : 'off'}`);
    out.plain(`  • bid threshold: ${agent.bidThreshold ?? '-'}`);
    out.plain(`  • max bid:       ${agent.maxBidAmount ?? '-'}`);
    out.plain(`  • config:        ${agent.nlConfig ?? '(none)'}`);
  };
}

export const agentList = makeAgentList();
