import open from 'open';
import { setTokens, type TokenData, getConfig } from './store.js';
import {
  DEFAULT_API_URL,
  CLIENT_ID,
  DEFAULT_SCOPES,
  POLLING_INTERVAL_MS,
} from '../config/constants.js';
import { AuthenticationError, NetworkError } from '../utils/errors.js';

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number;
  interval: number;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface OAuthError {
  error: string;
  error_description?: string;
}

export interface DeviceFlowCallbacks {
  onDeviceCode: (
    userCode: string,
    verificationUri: string,
    verificationUriComplete: string
  ) => void;
  onPolling: () => void;
  onSuccess: () => void;
  onError: (error: Error) => void;
}

function getApiUrl(): string {
  const config = getConfig();
  return config.apiUrl || DEFAULT_API_URL;
}

export async function requestDeviceCode(): Promise<DeviceCodeResponse> {
  const apiUrl = getApiUrl();

  try {
    const response = await fetch(`${apiUrl}/api/v1/oauth/device/code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        scope: DEFAULT_SCOPES,
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as OAuthError;
      throw new AuthenticationError(
        errorData.error_description || `Failed to request device code: ${response.status}`
      );
    }

    return (await response.json()) as DeviceCodeResponse;
  } catch (error) {
    if (error instanceof AuthenticationError) throw error;
    throw new NetworkError(`Failed to connect to API: ${(error as Error).message}`);
  }
}

export async function pollForToken(
  deviceCode: string,
  interval: number,
  expiresIn: number,
  callbacks: DeviceFlowCallbacks
): Promise<void> {
  const apiUrl = getApiUrl();
  const startTime = Date.now();
  const expiresAt = startTime + expiresIn * 1000;

  const poll = async (): Promise<void> => {
    if (Date.now() >= expiresAt) {
      throw new AuthenticationError('Device code expired. Please try again.');
    }

    callbacks.onPolling();

    try {
      const response = await fetch(`${apiUrl}/api/v1/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          device_code: deviceCode,
          client_id: CLIENT_ID,
        }),
      });

      if (response.ok) {
        const tokenResponse = (await response.json()) as TokenResponse;
        const tokenData: TokenData = {
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          expiresAt: Date.now() + tokenResponse.expires_in * 1000,
          scope: tokenResponse.scope,
        };
        setTokens(tokenData);
        callbacks.onSuccess();
        return;
      }

      const errorData = (await response.json()) as OAuthError;

      switch (errorData.error) {
        case 'authorization_pending':
          await sleep(interval * 1000);
          return poll();

        case 'slow_down':
          await sleep((interval + 5) * 1000);
          return poll();

        case 'access_denied':
          throw new AuthenticationError('Access denied. User rejected the authorization request.');

        case 'expired_token':
          throw new AuthenticationError('Device code expired. Please try again.');

        default:
          throw new AuthenticationError(
            errorData.error_description || `Authorization failed: ${errorData.error}`
          );
      }
    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      throw new NetworkError(`Failed to poll for token: ${(error as Error).message}`);
    }
  };

  await poll();
}

export async function openVerificationUri(uri: string): Promise<void> {
  await open(uri);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function startDeviceFlow(callbacks: DeviceFlowCallbacks): Promise<void> {
  try {
    const deviceCode = await requestDeviceCode();

    callbacks.onDeviceCode(
      deviceCode.user_code,
      deviceCode.verification_uri,
      deviceCode.verification_uri_complete
    );

    await openVerificationUri(deviceCode.verification_uri_complete);

    await pollForToken(
      deviceCode.device_code,
      deviceCode.interval || POLLING_INTERVAL_MS / 1000,
      deviceCode.expires_in,
      callbacks
    );
  } catch (error) {
    callbacks.onError(error as Error);
    throw error;
  }
}
