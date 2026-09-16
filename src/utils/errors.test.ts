import { afterEach, describe, expect, test } from 'bun:test';
import chalk from 'chalk';
import { APIError, AuthenticationError, NetworkError, formatError } from './errors.js';
import { setVerbose } from './logger.js';

chalk.level = 0;

afterEach(() => {
  setVerbose(false);
});

describe('formatError without verbose', () => {
  test('returns the message alone for a CLIError', () => {
    expect(
      formatError(new APIError('Request failed with status 400', 400, '{"error":"bad id"}'))
    ).toBe('Request failed with status 400');
  });

  test('returns the message alone for a plain Error', () => {
    expect(formatError(new Error('boom'))).toBe('boom');
  });

  test('stringifies a non-Error value', () => {
    expect(formatError('boom')).toBe('boom');
  });
});

describe('formatError with verbose', () => {
  test('includes the HTTP status and the raw response body of an APIError', () => {
    setVerbose(true);
    const formatted = formatError(
      new APIError('Request failed with status 400', 400, '{"error":"ticket_id must be a UUID"}')
    );

    expect(formatted).toStartWith('Request failed with status 400\n');
    expect(formatted).toContain('status: 400');
    expect(formatted).toContain('response: {"error":"ticket_id must be a UUID"}');
  });

  test('truncates an oversized response body', () => {
    setVerbose(true);
    const formatted = formatError(new APIError('Request failed', 500, 'y'.repeat(2500)));

    expect(formatted).toContain('… (truncated)');
    expect(formatted).not.toContain('y'.repeat(2001));
  });

  test('omits the response line when no body was captured', () => {
    setVerbose(true);
    const formatted = formatError(new APIError('Request failed with status 502', 502));

    expect(formatted).toContain('status: 502');
    expect(formatted).not.toContain('response:');
  });

  test('includes a stack trace without repeating the message line', () => {
    setVerbose(true);
    const formatted = formatError(new AuthenticationError('Session expired.'));

    expect(formatted).toStartWith('Session expired.\n');
    expect(formatted).toContain('at ');
    expect(formatted.match(/Session expired\./g)).toHaveLength(1);
  });

  test('walks the cause chain so the underlying failure is visible', () => {
    setVerbose(true);
    const root = new Error('ECONNREFUSED');
    const wrapper = new NetworkError('Network error: ECONNREFUSED', { cause: root });

    expect(formatError(wrapper)).toContain('caused by: Error: ECONNREFUSED');
  });
});
