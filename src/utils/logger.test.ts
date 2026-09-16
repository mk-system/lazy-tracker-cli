import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import chalk from 'chalk';
import {
  debug,
  debugRequest,
  debugResponse,
  isVerbose,
  setVerbose,
  truncateForLog,
} from './logger.js';

chalk.level = 0;

const originalStderrWrite = process.stderr.write;
const originalStdoutWrite = process.stdout.write;
let stderr: string[];
let stdout: string[];

beforeEach(() => {
  stderr = [];
  stdout = [];
  process.stderr.write = ((chunk: unknown) => {
    stderr.push(String(chunk));
    return true;
  }) as typeof process.stderr.write;
  process.stdout.write = ((chunk: unknown) => {
    stdout.push(String(chunk));
    return true;
  }) as typeof process.stdout.write;
});

afterEach(() => {
  process.stderr.write = originalStderrWrite;
  process.stdout.write = originalStdoutWrite;
  setVerbose(false);
});

describe('verbose flag', () => {
  test('defaults to off', () => {
    expect(isVerbose()).toBe(false);
  });

  test('reflects the last setVerbose call', () => {
    setVerbose(true);
    expect(isVerbose()).toBe(true);
    setVerbose(false);
    expect(isVerbose()).toBe(false);
  });
});

describe('debug', () => {
  test('writes nothing while verbose is off', () => {
    debug('hidden');
    debugRequest('GET', 'https://api.example.com/v1/tickets');
    debugResponse('GET', 'https://api.example.com/v1/tickets', 200, 12);

    expect(stderr).toEqual([]);
  });

  test('writes to stderr only, so stdout stays a clean JSON channel', () => {
    setVerbose(true);
    debug('shown');

    expect(stderr.join('')).toBe('[debug] shown\n');
    expect(stdout).toEqual([]);
  });
});

describe('debugRequest', () => {
  test('records the method and URL', () => {
    setVerbose(true);
    debugRequest('POST', 'https://api.example.com/api/v1/tickets/213/chats');

    expect(stderr.join('')).toBe(
      '[debug] → POST https://api.example.com/api/v1/tickets/213/chats\n'
    );
  });
});

describe('debugResponse', () => {
  test('records the status and elapsed time', () => {
    setVerbose(true);
    debugResponse('GET', 'https://api.example.com/api/v1/teams', 400, 137);

    expect(stderr.join('')).toBe(
      '[debug] ← 400 GET https://api.example.com/api/v1/teams (137ms)\n'
    );
  });
});

describe('truncateForLog', () => {
  test('leaves text within the cap untouched', () => {
    expect(truncateForLog('short body')).toBe('short body');
  });

  test('caps oversized text at 2000 characters and marks it truncated', () => {
    const truncated = truncateForLog('x'.repeat(2500));

    expect(truncated.startsWith('x'.repeat(2000))).toBe(true);
    expect(truncated).toEndWith('… (truncated)');
  });
});
