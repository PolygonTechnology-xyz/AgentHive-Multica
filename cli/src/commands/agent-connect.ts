import prompts from 'prompts';
import * as api from '../lib/api';
import { readConfig, updateConfig } from '../lib/config';
import { ui } from '../lib/ui';

export interface AgentConnectOptions {
  name?: string;
  capabilities?: string;
  apiUrl?: string;
}

export interface AgentConnectDeps {
  prompt?: typeof prompts;
  getAgent?: typeof api.getBidderAgent;
  updateAgent?: typeof api.updateBidderAgent;
  readCfg?: typeof readConfig;
  writeCfg?: typeof updateConfig;
  out?: typeof ui;
}

/**
 * Build the natural-language config sent to the bidder-agent's scoring engine
 * from the operator-supplied name + capabilities list.
 */
export function buildNlConfig(name: string, capabilities: string[]): string {
  const caps = capabilities.map((c) => c.trim()).filter((c) => c.length > 0);
  if (caps.length === 0) {
    return `Workforce Agent "${name}".`;
  }
  return `Workforce Agent "${name}". Bid on jobs involving: ${caps.join(', ')}.`;
}

export function makeAgentConnect(deps: AgentConnectDeps = {}) {
  const prompt = deps.prompt ?? prompts;
  const getAgent = deps.getAgent ?? api.getBidderAgent;
  const updateAgent = deps.updateAgent ?? api.updateBidderAgent;
  const readCfg = deps.readCfg ?? readConfig;
  const writeCfg = deps.writeCfg ?? updateConfig;
  const out = deps.out ?? ui;

  return async function run(opts: AgentConnectOptions = {}): Promise<void> {
    const cfg = readCfg();
    if (!cfg.access_token) {
      out.error('Not logged in. Run `agenthive auth login` first.');
      throw new Error('Not authenticated');
    }

    const answers = await prompt(
      [
        opts.name
          ? null
          : {
              type: 'text',
              name: 'name',
              message: 'Agent name',
              validate: (v: string) => (v && v.trim().length > 0 ? true : 'Name required'),
            },
        opts.capabilities
          ? null
          : {
              type: 'text',
              name: 'capabilities',
              message: 'Capabilities (comma-separated, e.g. react, nextjs, copywriting)',
              validate: (v: string) =>
                v && v.trim().length > 0 ? true : 'At least one capability',
            },
      ].filter(Boolean) as prompts.PromptObject[],
    );

    const name = (opts.name ?? (answers as { name?: string }).name ?? '').trim();
    const capsRaw = opts.capabilities ?? (answers as { capabilities?: string }).capabilities ?? '';

    if (!name || !capsRaw) {
      out.error('Cancelled.');
      throw new Error('Missing agent details');
    }

    const capabilities = capsRaw.split(',').map((c) => c.trim()).filter(Boolean);
    const nlConfig = buildNlConfig(name, capabilities);

    // Ensure an agent record exists on the server side (creates on first GET in some
    // backends; harmless when one already exists).
    let existing: api.BidderAgent | null = null;
    try {
      existing = await getAgent({ apiUrl: opts.apiUrl });
    } catch (err) {
      out.warn(`Could not fetch existing agent: ${(err as Error).message}`);
    }

    const updated = await updateAgent({ nlConfig }, { apiUrl: opts.apiUrl });
    const agentId = updated.id ?? existing?.id;

    if (agentId) {
      writeCfg({ agent_id: agentId });
    }

    out.success(`Agent "${out.bold(name)}" connected.`);
    out.info(`Capabilities: ${capabilities.join(', ')}`);
    if (agentId) out.info(`Agent id: ${out.dim(agentId)}`);
  };
}

export const agentConnect = makeAgentConnect();
