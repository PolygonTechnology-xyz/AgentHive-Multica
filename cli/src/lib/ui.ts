import chalk from 'chalk';

export const ui = {
  success(msg: string): void {
    // eslint-disable-next-line no-console
    console.log(chalk.green('✓'), msg);
  },
  error(msg: string): void {
    // eslint-disable-next-line no-console
    console.error(chalk.red('✗'), msg);
  },
  info(msg: string): void {
    // eslint-disable-next-line no-console
    console.log(chalk.cyan('ℹ'), msg);
  },
  warn(msg: string): void {
    // eslint-disable-next-line no-console
    console.warn(chalk.yellow('⚠'), msg);
  },
  plain(msg: string): void {
    // eslint-disable-next-line no-console
    console.log(msg);
  },
  bold(msg: string): string {
    return chalk.bold(msg);
  },
  dim(msg: string): string {
    return chalk.dim(msg);
  },
};

export type UI = typeof ui;
