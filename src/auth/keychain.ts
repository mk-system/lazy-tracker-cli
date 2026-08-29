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
  // The `security` binary ships with every macOS install, so its presence
  // isn't worth probing for. A prior version of this function ran
  // `security help` here, but that call returned true whether it succeeded
  // or failed (`security help` itself exits with code 1), so it never
  // affected the result — it only added a subprocess spawn to every command.
  return isMacOS();
}

export class KeychainError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'KeychainError';
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
  try {
    runSecurity('add-generic-password', '-a', ACCOUNT_NAME, '-s', SERVICE_NAME, '-w', value, '-U');
  } catch (error) {
    // Unlike keychainGet/keychainDelete, a failure here must not be silently
    // swallowed (the value would be lost with nowhere else it's stored). Wrap
    // it in a distinguishable type so callers can tell "Keychain is locked/
    // unavailable" apart from "the network request failed".
    throw new KeychainError(
      `Failed to write to macOS Keychain: ${(error as Error).message}`,
      error
    );
  }
}

export function keychainDelete(): void {
  try {
    runSecurity('delete-generic-password', '-a', ACCOUNT_NAME, '-s', SERVICE_NAME);
  } catch {
    // Already deleted or doesn't exist
  }
}
