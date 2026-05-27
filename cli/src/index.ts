#!/usr/bin/env node
import { Command } from 'commander';
import { authLogin } from './commands/auth-login';
import { authLogout } from './commands/auth-logout';
import { agentConnect } from './commands/agent-connect';
import { agentList } from './commands/agent-list';
import { deliver } from './commands/deliver';
import { ui } from './lib/ui';

const VERSION = '0.1.0';

export function buildProgram(): Command {
  const program = new Command();
  program
    .name('agenthive')
    .description('AgentHive CLI — register and manage your Workforce Agents.')
    .version(VERSION)
    .option('--api-url <url>', 'Override the AgentHive API base URL');

  const auth = program.command('auth').description('Authenticate with AgentHive');
  auth
    .command('login')
    .description('Email + password login. Stores access token in ~/.agenthive/config.json.')
    .option('--email <email>', 'Email address (skips prompt)')
    .option('--password <password>', 'Password (skips prompt; prefer interactive)')
    .action(async (opts, cmd) => {
      const apiUrl = cmd.optsWithGlobals().apiUrl as string | undefined;
      await authLogin({ ...opts, apiUrl });
    });

  auth
    .command('logout')
    .description('Clears the stored token and local config.')
    .action(async (_opts, cmd) => {
      const apiUrl = cmd.optsWithGlobals().apiUrl as string | undefined;
      await authLogout({ apiUrl });
    });

  const agent = program.command('agent').description('Manage Workforce Agents');
  agent
    .command('connect')
    .description('Register / update your Workforce Agent (prompts for name + capabilities).')
    .option('--name <name>', 'Agent name (skips prompt)')
    .option('--capabilities <list>', 'Comma-separated capabilities (skips prompt)')
    .action(async (opts, cmd) => {
      const apiUrl = cmd.optsWithGlobals().apiUrl as string | undefined;
      await agentConnect({ ...opts, apiUrl });
    });

  agent
    .command('list')
    .description('List Workforce Agents registered to your account.')
    .option('--json', 'Emit JSON instead of a formatted table')
    .action(async (opts, cmd) => {
      const apiUrl = cmd.optsWithGlobals().apiUrl as string | undefined;
      await agentList({ ...opts, apiUrl });
    });

  program
    .command('deliver')
    .description('Submit delivery files for the active dispatch.')
    .option('--dispatch-id <id>', 'Dispatch id (defaults to the cached active dispatch)')
    .option('--message <text>', 'Delivery message')
    .option(
      '--file <name=url...>',
      'Attachment in `name=url` form (or bare URL). Repeat for multiple.',
      collect,
      [] as string[],
    )
    .action(async (opts, cmd) => {
      const apiUrl = cmd.optsWithGlobals().apiUrl as string | undefined;
      await deliver({
        dispatchId: opts.dispatchId,
        message: opts.message,
        file: opts.file,
        apiUrl,
      });
    });

  return program;
}

function collect(value: string, prev: string[]): string[] {
  return [...prev, value];
}

export async function main(argv: string[] = process.argv): Promise<number> {
  const program = buildProgram();
  try {
    await program.parseAsync(argv);
    return 0;
  } catch (err) {
    ui.error((err as Error).message || 'Command failed');
    return 1;
  }
}

/* istanbul ignore next */
if (require.main === module) {
  main().then((code) => process.exit(code));
}
