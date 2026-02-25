import { getValidAccessToken } from '../auth/manager.js';
import { getConfig } from '../auth/store.js';
import { DEFAULT_API_URL } from '../config/constants.js';
import { APIError, NetworkError } from '../utils/errors.js';

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function convertKeysToSnakeCase(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(convertKeysToSnakeCase);
  if (typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([key, value]) => [
        camelToSnake(key),
        convertKeysToSnakeCase(value),
      ])
    );
  }
  return obj;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

function getBaseUrl(): string {
  const config = getConfig();
  return config.apiUrl || DEFAULT_API_URL;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, requiresAuth = true } = options;
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/v1${path}`;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (requiresAuth) {
    const token = await getValidAccessToken();
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(convertKeysToSnakeCase(body)) : undefined,
    });

    if (!response.ok) {
      const defaultMessage = `Request failed with status ${response.status}`;
      const errorMessage = await response
        .json()
        .then(
          (data: { message?: string; error?: string }) =>
            data.message || data.error || defaultMessage
        )
        .catch(() => defaultMessage);
      throw new APIError(errorMessage, response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new NetworkError(`Network error: ${(error as Error).message}`);
  }
}

export async function get<T>(path: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
  return request<T>(path, { ...options, method: 'GET' });
}

export async function post<T>(
  path: string,
  body?: unknown,
  options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
  return request<T>(path, { ...options, method: 'POST', body });
}

export async function put<T>(
  path: string,
  body?: unknown,
  options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
  return request<T>(path, { ...options, method: 'PUT', body });
}

export async function del<T>(path: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
  return request<T>(path, { ...options, method: 'DELETE' });
}
