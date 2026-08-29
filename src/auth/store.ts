import Conf from 'conf';

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string;
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

// In-process-only override for apiUrl. Kept separate from the persisted store so that
// `--api-url` (a per-invocation override, see index.ts) never gets written to disk —
// only the explicit `config:set api-url` path persists a new apiUrl.
let apiUrlOverride: string | undefined;

export function setApiUrlOverride(url: string): void {
  apiUrlOverride = url;
}

export function getTokens(): TokenData | undefined {
  return store.get('tokens');
}

export function setTokens(tokens: TokenData): void {
  store.set('tokens', tokens);
}

export function clearTokens(): void {
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
