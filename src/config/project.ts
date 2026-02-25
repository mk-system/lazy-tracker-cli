import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { getConfig } from '../auth/store.js';

export interface ProjectConfig {
  team: string;
  project: string;
}

interface PartialProjectConfig {
  team?: string;
  project?: string;
}

const CONFIG_FILENAME = '.lazy-tracker.json';

/**
 * カレントディレクトリから上位に向かって .lazy-tracker.json を探索し、読み込む
 * team, project のいずれかが設定されていれば部分的に返す
 */
function tryReadConfig(configPath: string): PartialProjectConfig | undefined {
  if (!existsSync(configPath)) return undefined;
  try {
    const content = readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(content) as PartialProjectConfig;
    if (typeof parsed.team === 'string' || typeof parsed.project === 'string') {
      return {
        team: typeof parsed.team === 'string' ? parsed.team : undefined,
        project: typeof parsed.project === 'string' ? parsed.project : undefined,
      };
    }
  } catch {
    // 読み込みエラーは無視
  }
  return undefined;
}

function getAncestorDirs(startDir: string): string[] {
  const dirs: string[] = [];
  const addDir = (dir: string): void => {
    dirs.push(dir);
    const parent = dirname(dir);
    if (parent !== dir) addDir(parent);
  };
  addDir(startDir);
  return dirs;
}

export function findProjectConfig(): PartialProjectConfig | undefined {
  const dirs = getAncestorDirs(process.cwd());
  for (const dir of dirs) {
    const config = tryReadConfig(resolve(dir, CONFIG_FILENAME));
    if (config) return config;
  }
  return undefined;
}

/**
 * team/project を解決する
 * 優先順位: CLI オプション → .lazy-tracker.json → グローバル config
 * 各ソースから team/project を個別に取得してマージする
 * 解決できない場合は undefined を返す
 */
export function resolveTeamProject(options: {
  team?: string;
  project?: string;
}): { team: string; project: string } | undefined {
  const globalConfig = getConfig();
  const fileConfig = findProjectConfig();

  // 各ソースから team/project を取得（優先順位: CLI > file > global）
  const team = options.team || fileConfig?.team || globalConfig.defaultTeam;
  const project = options.project || fileConfig?.project || globalConfig.defaultProject;

  if (team && project) {
    return { team, project };
  }

  return undefined;
}
