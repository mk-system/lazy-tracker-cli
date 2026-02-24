import { getTokens, setTokens, clearTokens, type TokenData, getConfig } from './store.js';
import { TOKEN_EXPIRY_BUFFER_MS, DEFAULT_API_URL, CLIENT_ID } from '../config/constants.js';
import { AuthenticationError } from '../utils/errors.js';

export function isAuthenticated(): boolean {
  const tokens = getTokens();
  return tokens !== undefined;
}

export function isTokenExpired(): boolean {
  const tokens = getTokens();
  if (!tokens) return true;
  return Date.now() >= tokens.expiresAt - TOKEN_EXPIRY_BUFFER_MS;
}

export async function getValidAccessToken(): Promise<string> {
  const tokens = getTokens();
  if (!tokens) {
    throw new AuthenticationError('Not authenticated. Run `lt auth login` first.');
  }

  if (!isTokenExpired()) {
    return tokens.accessToken;
  }

  const refreshed = await refreshAccessToken(tokens.refreshToken);
  return refreshed.accessToken;
}

async function refreshAccessToken(refreshToken: string): Promise<TokenData> {
  const config = getConfig();
  const apiUrl = config.apiUrl || DEFAULT_API_URL;

  const response = await fetch(`${apiUrl}/api/v1/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
    }),
  });

  if (!response.ok) {
    clearTokens();
    throw new AuthenticationError('Session expired. Please login again with `lt auth login`.');
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
  };

  const tokenData: TokenData = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    scope: data.scope,
  };

  setTokens(tokenData);
  return tokenData;
}

export function logout(): void {
  clearTokens();
}
