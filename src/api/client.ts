import { Api } from './__generated__/Api.js';
import { getValidAccessToken } from '../auth/manager.js';
import { getConfig } from '../auth/store.js';
import { DEFAULT_API_URL } from '../config/constants.js';
import { APIError, AuthenticationError, CLIError, NetworkError } from '../utils/errors.js';
import { debug, debugRequest, debugResponse, truncateForLog } from '../utils/logger.js';
import { clearTokens } from '../auth/store.js';
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

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

function parseErrorMessage(bodyText: string, fallback: string): string {
  try {
    const camelized = camelizeKeys(JSON.parse(bodyText)) as { message?: string; error?: string };
    return camelized.message || camelized.error || fallback;
  } catch {
    return fallback;
  }
}

export async function customFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = init?.method ?? 'GET';
  const url = requestUrl(input);
  const startedAt = Date.now();

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

    debugRequest(method, url);
    const response = await fetch(input, modifiedInit);
    debugResponse(method, url, response.status, Date.now() - startedAt);

    if (!response.ok) {
      // Read the body as text rather than json() so that a non-JSON error
      // response (an HTML 502 page, an empty body) is still recoverable for
      // diagnostics instead of collapsing into the status-code fallback.
      const bodyText = await response
        .clone()
        .text()
        .catch(() => '');
      if (bodyText) debug(`response body: ${truncateForLog(bodyText)}`);

      if (response.status === 401) {
        debug('401 received: clearing stored tokens');
        clearTokens();
        throw new AuthenticationError('Session expired. Please login again with `lt auth login`.');
      }

      const defaultMessage = `Request failed with status ${response.status}`;
      throw new APIError(
        parseErrorMessage(bodyText, defaultMessage),
        response.status,
        bodyText || undefined
      );
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
    // AuthenticationError is a sibling of APIError (both extend CLIError), not
    // a subtype of it — checking only `instanceof APIError` let it fall
    // through to the NetworkError branch below and lose its identity.
    if (error instanceof CLIError) throw error;
    throw new NetworkError(`Network error: ${(error as Error).message}`, { cause: error });
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
