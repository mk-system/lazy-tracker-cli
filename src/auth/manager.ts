import { getTokens, setTokens, clearTokens, type TokenData, getConfig } from './store.js';
import { TOKEN_EXPIRY_BUFFER_MS, DEFAULT_API_URL, CLIENT_ID } from '../config/constants.js';
import { AuthenticationError } from '../utils/errors.js';
import { debug, debugRequest, debugResponse } from '../utils/logger.js';

export async function ensureLoginable(): Promise<boolean> {
  const tokens = getTokens();
  if (!tokens) return true;

  if (!isTokenExpired()) return false;

  try {
    await refreshAccessToken(tokens.refreshToken);
    return false;
  } catch (error) {
    // Only a confirmed-invalid refresh token means the user actually needs
    // to go through the device flow again. A network blip or a Keychain
    // failure isn't proof the session is invalid — surface those instead of
    // silently forcing a fresh login.
    if (error instanceof AuthenticationError) return true;
    throw error;
  }
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

  // Neither the request nor the response body is logged here: both carry a
  // refresh token, and the success response carries an access token too.
  const url = `${apiUrl}/api/v1/oauth/token`;
  const startedAt = Date.now();
  debugRequest('POST', url);
  const response = await fetch(url, {
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
  debugResponse('POST', url, response.status, Date.now() - startedAt);

  if (!response.ok) {
    debug('token refresh failed: clearing stored tokens');
    clearTokens();
    throw new AuthenticationError('Session expired. Please login again with `lt auth login`.');
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_token_expires_in?: number;
    scope: string;
  };

  const tokenData: TokenData = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    refreshTokenExpiresAt: data.refresh_token_expires_in
      ? Date.now() + data.refresh_token_expires_in * 1000
      : undefined,
    scope: data.scope,
  };

  setTokens(tokenData);
  return tokenData;
}

export function logout(): void {
  clearTokens();
}
