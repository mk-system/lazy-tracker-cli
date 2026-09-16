import chalk from 'chalk';
import { isVerbose, truncateForLog } from './logger.js';

export class CLIError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'CLIError';
  }
}

export class AuthenticationError extends CLIError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class APIError extends CLIError {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly response?: unknown
  ) {
    super(message, 'API_ERROR');
    this.name = 'APIError';
  }
}

export class NetworkError extends CLIError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 'NETWORK_ERROR', options);
    this.name = 'NetworkError';
  }
}

export function formatError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (!isVerbose()) return message;

  const details = diagnosticLines(error);
  return details.length === 0 ? message : `${message}\n${chalk.dim(details.join('\n'))}`;
}

function diagnosticLines(error: unknown): string[] {
  const lines: string[] = [];

  if (error instanceof APIError) {
    lines.push(`  status: ${error.statusCode}`);
    const body = stringifyResponse(error.response);
    if (body !== undefined) {
      lines.push(`  response: ${body}`);
    }
  }

  if (error instanceof Error) {
    const stack = formatStack(error.stack);
    if (stack) lines.push(stack);
  }

  let cause: unknown = error instanceof Error ? error.cause : undefined;
  while (cause instanceof Error) {
    lines.push(`  caused by: ${cause.name}: ${cause.message}`);
    const stack = formatStack(cause.stack);
    if (stack) lines.push(stack);
    cause = cause.cause;
  }

  return lines;
}

function stringifyResponse(response: unknown): string | undefined {
  if (response === undefined || response === null) return undefined;
  const text = typeof response === 'string' ? response : JSON.stringify(response);
  if (!text) return undefined;
  return truncateForLog(text);
}

// Drops the stack's first line: it repeats "Name: message", which formatError
// has already printed on its own line.
function formatStack(stack: string | undefined): string | undefined {
  if (!stack) return undefined;
  const frames = stack
    .split('\n')
    .slice(1)
    .map((line) => `  ${line.trim()}`);
  return frames.length === 0 ? undefined : frames.join('\n');
}
