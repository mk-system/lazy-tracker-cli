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

export function getTokens(): TokenData | undefined {
  return store.get('tokens');
}

export function setTokens(tokens: TokenData): void {
  store.set('tokens', tokens);
}

export function clearTokens(): void {
  store.delete('tokens');
}

export function getConfig(): ConfigData {
  return store.get('config');
}

export function setConfig(config: ConfigData): void {
  store.set('config', config);
}

export function updateConfig(updates: Partial<ConfigData>): void {
  const current = getConfig();
  setConfig({ ...current, ...updates });
}

export function getStorePath(): string {
  return store.path;
}
