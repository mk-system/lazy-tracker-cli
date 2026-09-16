import chalk from 'chalk';
import { clearSpinnerLine } from './spinner.js';

const MAX_LOGGED_BODY_CHARS = 2000;

const state = { verbose: false };

export function setVerbose(enabled: boolean): void {
  state.verbose = enabled;
}

export function isVerbose(): boolean {
  return state.verbose;
}

export function debug(message: string): void {
  if (!state.verbose) return;
  // Every command writes its payload to stdout, so diagnostics must never go
  // there — `lt tickets list 2>/dev/null` has to stay parseable as JSON.
  // ora also draws on stderr; without clearing its live frame first the debug
  // line lands mid-frame and both become unreadable. ora redraws on next tick.
  clearSpinnerLine();
  process.stderr.write(`${chalk.dim(`[debug] ${message}`)}\n`);
}

// Takes method and URL only, never headers: securityWorker (src/api/client.ts)
// puts a Bearer token in them, and a logger that cannot see a header cannot
// leak one.
export function debugRequest(method: string, url: string): void {
  debug(`→ ${method} ${url}`);
}

export function debugResponse(
  method: string,
  url: string,
  status: number,
  elapsedMs: number
): void {
  debug(`← ${status} ${method} ${url} (${elapsedMs}ms)`);
}

export function truncateForLog(text: string): string {
  return text.length > MAX_LOGGED_BODY_CHARS
    ? `${text.slice(0, MAX_LOGGED_BODY_CHARS)}… (truncated)`
    : text;
}
