import { Command } from 'commander';
import { getTokens, clearTokens } from '../../auth/store.js';
import { logout } from '../../auth/manager.js';
import { getConfig } from '../../auth/store.js';
import { DEFAULT_API_URL } from '../../config/constants.js';
import { success, info } from '../../utils/output.js';
import { startSpinner, succeedSpinner, failSpinner } from '../../utils/spinner.js';

async function revokeToken(token: string): Promise<void> {
  const config = getConfig();
  const apiUrl = config.apiUrl || DEFAULT_API_URL;

  await fetch(`${apiUrl}/api/v1/oauth/revoke`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      token_type_hint: 'access_token',
    }),
  });

  clearTokens();
}

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
