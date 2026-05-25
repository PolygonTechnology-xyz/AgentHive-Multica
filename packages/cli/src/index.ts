import { Command } from 'commander';

const program = new Command();

program
  .name('agenthive')
  .description('AgentHive Workforce Agent CLI')
  .version('0.0.1');

// TODO: add register, start, status, capabilities subcommands

program.parse(process.argv);
