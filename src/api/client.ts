import { Api } from './__generated__/Api.js';
import { getValidAccessToken } from '../auth/manager.js';
import { getConfig } from '../auth/store.js';
import { DEFAULT_API_URL } from '../config/constants.js';
import { APIError, NetworkError } from '../utils/errors.js';
import type { RequestParams, ApiConfig } from './__generated__/http-client.js';

function getBaseUrl(): string {
  const config = getConfig();
  return config.apiUrl || DEFAULT_API_URL;
}

const securityWorker: ApiConfig<unknown>['securityWorker'] = async (_securityData) => {
  const token = await getValidAccessToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

async function customFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    const response = await fetch(input, init);

    if (!response.ok) {
      const defaultMessage = `Request failed with status ${response.status}`;
      const errorMessage = await response
        .clone()
        .json()
        .then(
          (data: { message?: string; error?: string }) =>
            data.message || data.error || defaultMessage
        )
        .catch(() => defaultMessage);
      throw new APIError(errorMessage, response.status);
    }

    return response;
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new NetworkError(`Network error: ${(error as Error).message}`);
  }
}

export const api = new (Api as new (config: ApiConfig<unknown>) => Api)({
  baseUrl: getBaseUrl(),
  securityWorker,
  customFetch,
});

export function updateApiBaseUrl(): void {
  (api as unknown as { baseUrl: string }).baseUrl = getBaseUrl();
}

export type { RequestParams };
