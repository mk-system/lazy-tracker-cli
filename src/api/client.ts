import { Api } from './__generated__/Api.js';
import { getValidAccessToken } from '../auth/manager.js';
import { getConfig } from '../auth/store.js';
import { DEFAULT_API_URL } from '../config/constants.js';
import { APIError, NetworkError } from '../utils/errors.js';
import type { RequestParams, ApiConfig } from './__generated__/http-client.js';
import humps from 'humps';
const { camelizeKeys, decamelizeKeys } = humps;

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
    // Convert request body from camelCase to snake_case
    let modifiedInit = init;
    if (init?.body && typeof init.body === 'string') {
      try {
        const parsed = JSON.parse(init.body);
        const converted = decamelizeKeys(parsed);
        modifiedInit = { ...init, body: JSON.stringify(converted) };
      } catch {
        // Not JSON, use original body
      }
    }

    const response = await fetch(input, modifiedInit);

    if (!response.ok) {
      const defaultMessage = `Request failed with status ${response.status}`;
      const errorMessage = await response
        .clone()
        .json()
        .then((data: { message?: string; error?: string }) => {
          const camelized = camelizeKeys(data) as { message?: string; error?: string };
          return camelized.message || camelized.error || defaultMessage;
        })
        .catch(() => defaultMessage);
      throw new APIError(errorMessage, response.status);
    }

    // Convert response body from snake_case to camelCase
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      const camelized = camelizeKeys(data);
      return new Response(JSON.stringify(camelized), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }

    return response;
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new NetworkError(`Network error: ${(error as Error).message}`);
  }
}

export const api = new (Api as new (config: ApiConfig<unknown>) => Api)({
  baseUrl: getBaseUrl(),
  baseApiParams: { secure: true },
  securityWorker,
  customFetch,
});

export function updateApiBaseUrl(): void {
  (api as unknown as { baseUrl: string }).baseUrl = getBaseUrl();
}

export type { RequestParams };
