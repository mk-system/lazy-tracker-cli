import { execFileSync } from 'node:child_process';

const SERVICE_NAME = 'lazy-tracker-cli';
const ACCOUNT_NAME = 'tokens';

function isMacOS(): boolean {
  return process.platform === 'darwin';
}

function runSecurity(...args: string[]): string {
  return execFileSync('security', args, {
    encoding: 'utf-8',
    timeout: 5000,
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim();
}

export function keychainAvailable(): boolean {
  if (!isMacOS()) return false;
  try {
    execFileSync('security', ['help'], {
      encoding: 'utf-8',
      timeout: 5000,
      stdio: 'pipe',
    });
    return true;
  } catch {
    return true; // security help exits with code 1 but is still available
  }
}

export function keychainGet(): string | undefined {
  try {
    return runSecurity('find-generic-password', '-a', ACCOUNT_NAME, '-s', SERVICE_NAME, '-w');
  } catch {
    return undefined;
  }
}

export function keychainSet(value: string): void {
  try {
    runSecurity('delete-generic-password', '-a', ACCOUNT_NAME, '-s', SERVICE_NAME);
  } catch {
    // Item may not exist yet
  }
  runSecurity('add-generic-password', '-a', ACCOUNT_NAME, '-s', SERVICE_NAME, '-w', value, '-U');
}

export function keychainDelete(): void {
  try {
    runSecurity('delete-generic-password', '-a', ACCOUNT_NAME, '-s', SERVICE_NAME);
  } catch {
    // Already deleted or doesn't exist
  }
}
