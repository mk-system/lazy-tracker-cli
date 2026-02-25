import { Command } from 'commander';
import chalk from 'chalk';
import { startDeviceFlow } from '../../auth/device-flow.js';
import { isAuthenticated } from '../../auth/manager.js';
import { startSpinner, succeedSpinner, failSpinner, stopSpinner } from '../../utils/spinner.js';
import { success, error as outputError, info } from '../../utils/output.js';

export const loginCommand = new Command('login')
  .description('Login to Lazy Tracker using OAuth Device Authorization')
  .option('-f, --force', 'Force re-login even if already authenticated')
  .action(async (options) => {
    if (isAuthenticated() && !options.force) {
      info('Already authenticated. Use --force to re-login.');
      return;
    }

    console.log();
    console.log(chalk.bold('Logging in to Lazy Tracker...'));
    console.log();

    const spinnerState: { instance: ReturnType<typeof startSpinner> | null } = { instance: null };

    try {
      await startDeviceFlow({
        onDeviceCode: (userCode, verificationUri, _verificationUriComplete) => {
          console.log('Your device code is:');
          console.log();
          console.log('  ' + chalk.bold.cyan(userCode));
          console.log();
          console.log('Opening browser to authorize...');
          console.log(chalk.dim(`If the browser doesn't open, visit: ${verificationUri}`));
          console.log();
          spinnerState.instance = startSpinner('Waiting for authorization...');
        },
        onPolling: () => {
          // Keep spinner running
        },
        onSuccess: () => {
          if (spinnerState.instance) {
            succeedSpinner('Authorization successful!');
          }
          console.log();
          success('You are now logged in to Lazy Tracker.');
        },
        onError: (err) => {
          if (spinnerState.instance) {
            failSpinner('Authorization failed');
          }
          outputError(err.message);
        },
      });
    } catch {
      if (spinnerState.instance) {
        stopSpinner(spinnerState.instance);
      }
      process.exit(1);
    }
  });
