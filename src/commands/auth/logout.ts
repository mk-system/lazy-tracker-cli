import { Command } from 'commander';
import { getTokens } from '../../auth/store.js';
import { logout } from '../../auth/manager.js';
import { revokeToken } from '../../api/oauth.js';
import { success, info } from '../../utils/output.js';
import { startSpinner, succeedSpinner, failSpinner } from '../../utils/spinner.js';

export const logoutCommand = new Command('logout')
  .description('Logout from Lazy Tracker')
  .option('--revoke', 'Revoke the access token on the server')
  .action(async (options) => {
    const tokens = getTokens();

    if (!tokens) {
      info('Not currently logged in.');
      return;
    }

    if (options.revoke) {
      const spinner = startSpinner('Revoking token...');
      try {
        await revokeToken(tokens.accessToken);
        succeedSpinner('Token revoked', spinner);
      } catch {
        failSpinner('Failed to revoke token (clearing local credentials anyway)', spinner);
      }
    }

    logout();
    success('Logged out successfully.');
  });
