import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import chalk from 'chalk';
import { customFetch } from './client.js';
import { APIError } from '../utils/errors.js';
import { setVerbose } from '../utils/logger.js';

chalk.level = 0;

const TOKEN = 'secret-access-token';
const URL_UNDER_TEST = 'https://api.example.com/api/v1/tickets/213/chats';
const AUTHORIZED_INIT: RequestInit = {
  method: 'GET',
  headers: { Authorization: `Bearer ${TOKEN}` },
};

const originalFetch = globalThis.fetch;
const originalStderrWrite = process.stderr.write;
let stderr: string;

function respondWith(body: string, init: ResponseInit): void {
  globalThis.fetch = (() =>
    Promise.resolve(
      new Response(body, { headers: { 'content-type': 'application/json' }, ...init })
    )) as unknown as typeof fetch;
}

beforeEach(() => {
  stderr = '';
  process.stderr.write = ((chunk: unknown) => {
    stderr += String(chunk);
    return true;
  }) as typeof process.stderr.write;
});

afterEach(() => {
  process.stderr.write = originalStderrWrite;
  globalThis.fetch = originalFetch;
  setVerbose(false);
});

describe('customFetch logging', () => {
  test('records the method, URL and status of a successful request', async () => {
    setVerbose(true);
    respondWith('{"ok":true}', { status: 200 });

    await customFetch(URL_UNDER_TEST, AUTHORIZED_INIT);

    expect(stderr).toContain(`→ GET ${URL_UNDER_TEST}`);
    expect(stderr).toContain(`← 200 GET ${URL_UNDER_TEST}`);
  });

  test('never logs the Authorization header or the bearer token', async () => {
    setVerbose(true);
    respondWith('{"error":"ticket_id must be a UUID"}', { status: 400 });

    await customFetch(URL_UNDER_TEST, AUTHORIZED_INIT).catch(() => undefined);

    expect(stderr).not.toContain(TOKEN);
    expect(stderr).not.toContain('Authorization');
  });

  test('records the error response body that the status line alone would hide', async () => {
    setVerbose(true);
    respondWith('{"error":"ticket_id must be a UUID"}', { status: 400 });

    await customFetch(URL_UNDER_TEST, AUTHORIZED_INIT).catch(() => undefined);

    expect(stderr).toContain('response body: {"error":"ticket_id must be a UUID"}');
  });

  test('stays silent while verbose is off', async () => {
    respondWith('{"error":"ticket_id must be a UUID"}', { status: 400 });

    await customFetch(URL_UNDER_TEST, AUTHORIZED_INIT).catch(() => undefined);

    expect(stderr).toBe('');
  });
});

describe('customFetch error mapping', () => {
  test('keeps the raw error body on APIError.response', async () => {
    respondWith('{"error":"ticket_id must be a UUID"}', { status: 400 });

    const error = await customFetch(URL_UNDER_TEST, AUTHORIZED_INIT).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(APIError);
    expect((error as APIError).statusCode).toBe(400);
    expect((error as APIError).response).toBe('{"error":"ticket_id must be a UUID"}');
  });

  test('falls back to the status message but still keeps a non-JSON body', async () => {
    respondWith('<html>502 Bad Gateway</html>', {
      status: 502,
      headers: { 'content-type': 'text/html' },
    });

    const error = (await customFetch(URL_UNDER_TEST, AUTHORIZED_INIT).catch(
      (e: unknown) => e
    )) as APIError;

    expect(error.message).toBe('Request failed with status 502');
    expect(error.response).toBe('<html>502 Bad Gateway</html>');
  });
});
