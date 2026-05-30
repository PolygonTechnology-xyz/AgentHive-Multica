import prompts from 'prompts';
import * as api from '../lib/api';
import { readConfig } from '../lib/config';
import { ui } from '../lib/ui';

export interface AgentConnectOptions {
  name?: string;
  capabilities?: string;
  apiUrl?: string;
}

export interface AgentConnectDeps {
  prompt?: typeof prompts;
  createAgent?: typeof api.createWorkforceAgent;
  readCfg?: typeof readConfig;
  out?: typeof ui;
}

export function parseCapabilities(value: string): string[] {
  return value.split(',').map((capability) => capability.trim()).filter(Boolean);
}

export function makeAgentConnect(deps: AgentConnectDeps = {}) {
  const prompt = deps.prompt ?? prompts;
  const createAgent = deps.createAgent ?? api.createWorkforceAgent;
  const readCfg = deps.readCfg ?? readConfig;
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
              message: 'Skills (comma-separated, e.g. react, nextjs, copywriting)',
              validate: (v: string) =>
                v && v.trim().length > 0 ? true : 'At least one skill',
            },
      ].filter(Boolean) as prompts.PromptObject[],
    );

    const name = (opts.name ?? (answers as { name?: string }).name ?? '').trim();
    const capsRaw = opts.capabilities ?? (answers as { capabilities?: string }).capabilities ?? '';
    const skills = parseCapabilities(capsRaw);

    if (!name || skills.length === 0) {
      out.error('Cancelled.');
      throw new Error('Missing agent details');
    }

    const agent = await createAgent({ name, skills }, { apiUrl: opts.apiUrl });

    out.success(`Agent "${out.bold(agent.name)}" connected.`);
    out.info(`Agent id: ${out.dim(agent.id)}`);
    out.info(`Status: ${agent.status}`);
  };
}

export const agentConnect = makeAgentConnect();
