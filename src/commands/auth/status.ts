import { Command } from 'commander';
import chalk from 'chalk';
import { getTokens, getConfig, getStorePath } from '../../auth/store.js';
import { isTokenExpired } from '../../auth/manager.js';
import { success, error as outputError, info, dim } from '../../utils/output.js';

export const statusCommand = new Command('status')
  .description('Show current authentication status')
  .action(async () => {
    const tokens = getTokens();
    const config = getConfig();

    console.log();
    console.log(chalk.bold('Authentication Status'));
    console.log();

    if (!tokens) {
      outputError('Not authenticated');
      console.log();
      info('Run `lt auth login` to authenticate.');
      return;
    }

    const expired = isTokenExpired();
    const expiresAt = new Date(tokens.expiresAt);

    if (expired) {
      console.log(chalk.yellow('!'), 'Token expired (will refresh on next request)');
    } else {
      success('Authenticated');
    }

    console.log();
    console.log('  Token expires:', expiresAt.toLocaleString());
    console.log('  Scopes:', tokens.scope);

    if (config.apiUrl) {
      console.log('  API URL:', config.apiUrl);
    }

    console.log();
    dim(`Config stored at: ${getStorePath()}`);
  });
