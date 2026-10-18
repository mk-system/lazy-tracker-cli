import Conf from 'conf';
import { keychainAvailable, keychainGet, keychainSet, keychainDelete } from './keychain.js';

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  refreshTokenExpiresAt?: number;
}

export interface ConfigData {
  apiUrl?: string;
  defaultTeam?: string;
  defaultProject?: string;
}

interface StoreSchema {
  tokens?: TokenData;
  config: ConfigData;
}

const store = new Conf<StoreSchema>({
  projectName: 'lazy-tracker-cli',
  defaults: {
    config: {},
  },
});

const useKeychain = keychainAvailable();

// Migrate tokens from filesystem to Keychain on first run. This runs at
// module load time for every command (including ones unrelated to auth), so
// a Keychain failure here (locked, non-interactive session, etc.) must not
// take the whole CLI down with it — leave the tokens in the file store and
// retry the migration on the next invocation.
if (useKeychain) {
  try {
    const fileTokens = store.get('tokens');
    if (fileTokens && !keychainGet()) {
      keychainSet(JSON.stringify(fileTokens));
      store.delete('tokens');
    }
  } catch {
    // Migration failed; fileTokens (if any) is still intact in the store.
  }
}

// In-process-only override for apiUrl. Kept separate from the persisted store so that
// `--api-url` (a per-invocation override, see index.ts) never gets written to disk —
// only the explicit `config:set api-url` path persists a new apiUrl.
let apiUrlOverride: string | undefined;

export function setApiUrlOverride(url: string): void {
  apiUrlOverride = url;
}

export function getTokens(): TokenData | undefined {
  if (useKeychain) {
    const raw = keychainGet();
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as TokenData;
    } catch {
      return undefined;
    }
  }
  return store.get('tokens');
}

export function setTokens(tokens: TokenData): void {
  if (useKeychain) {
    keychainSet(JSON.stringify(tokens));
    store.delete('tokens');
    return;
  }
  store.set('tokens', tokens);
}

export function clearTokens(): void {
  if (useKeychain) {
    keychainDelete();
  }
  store.delete('tokens');
}

function readStoredConfig(): ConfigData {
  return store.get('config');
}

export function getConfig(): ConfigData {
  const config = readStoredConfig();
  return apiUrlOverride ? { ...config, apiUrl: apiUrlOverride } : config;
}

export function setConfig(config: ConfigData): void {
  store.set('config', config);
}

export function updateConfig(updates: Partial<ConfigData>): void {
  // Reads the raw stored config (not getConfig()'s override-merged view) so that an
  // active --api-url override never gets folded back into what gets persisted here.
  const current = readStoredConfig();
  setConfig({ ...current, ...updates });
}

export function getStorePath(): string {
  return store.path;
}

export function isUsingKeychain(): boolean {
  return useKeychain;
}
