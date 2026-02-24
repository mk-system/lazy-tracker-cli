import { getConfig, clearTokens } from '../auth/store.js';
import { DEFAULT_API_URL } from '../config/constants.js';

export async function revokeToken(token: string): Promise<void> {
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
