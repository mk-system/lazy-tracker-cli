import { Command } from 'commander';
import chalk from 'chalk';
import { authCommand } from './commands/auth/index.js';
import { teamsCommand } from './commands/teams/index.js';
import { projectsCommand } from './commands/projects/index.js';
import { ticketsCommand } from './commands/tickets/index.js';
import { commentsCommand } from './commands/comments/index.js';
import { updateConfig, getConfig, setApiUrlOverride } from './auth/store.js';
import { DEFAULT_API_URL } from './config/constants.js';

function validateApiUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    console.error(chalk.red('Invalid API URL: must be a valid URL'));
    process.exit(1);
  }
  if (parsed.protocol !== 'https:') {
    console.error(chalk.red('Invalid API URL: only https:// is allowed'));
    process.exit(1);
  }
}

const program = new Command();

program
  .name('lt')
  .description('Lazy Tracker CLI - A command-line interface for Lazy Tracker')
  .version('0.1.0')
  .option('--api-url <url>', 'API URL override (this invocation only, not persisted)')
  .option('--no-color', 'Disable colored output')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.apiUrl) {
      validateApiUrl(opts.apiUrl);
      setApiUrlOverride(opts.apiUrl);
    }
    if (opts.color === false) {
      chalk.level = 0;
    }
  });

program.addCommand(authCommand);
program.addCommand(teamsCommand);
program.addCommand(projectsCommand);
program.addCommand(ticketsCommand);
program.addCommand(commentsCommand);

program
  .command('config')
  .description('Show current configuration')
  .action(() => {
    const config = getConfig();
    console.log();
    console.log(chalk.bold('Current Configuration'));
    console.log();
    console.log(
      '  API URL:',
      config.apiUrl || DEFAULT_API_URL,
      config.apiUrl ? '' : chalk.dim('(default)')
    );
    console.log('  Default Team:', config.defaultTeam || chalk.dim('(not set)'));
    console.log('  Default Project:', config.defaultProject || chalk.dim('(not set)'));
  });

program
  .command('config:set')
  .description('Set configuration value')
  .argument('<key>', 'Configuration key (api-url, default-team, default-project)')
  .argument('<value>', 'Configuration value')
  .action((key, value) => {
    const keyMap: Record<string, keyof ReturnType<typeof getConfig>> = {
      'api-url': 'apiUrl',
      'default-team': 'defaultTeam',
      'default-project': 'defaultProject',
    };

    const configKey = keyMap[key];
    if (!configKey) {
      console.error(`Unknown configuration key: ${key}`);
      console.error(`Valid keys: ${Object.keys(keyMap).join(', ')}`);
      process.exit(1);
    }

    if (configKey === 'apiUrl') {
      validateApiUrl(value);
    }

    updateConfig({ [configKey]: value });
    console.log(chalk.green('✓'), `Set ${key} to ${value}`);
  });

export { program };
