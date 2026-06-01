import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { homedir } from 'node:os';

interface AgentConfig {
  readonly skillsDir: string;
}

export const AGENTS = {
  'claude-code': { skillsDir: '.claude/skills' },
  codex: { skillsDir: '.agents/skills' },
  copilot: { skillsDir: '.agents/skills' },
  cursor: { skillsDir: '.agents/skills' },
} as const satisfies Record<string, AgentConfig>;

export type AgentName = keyof typeof AGENTS;

export function isAgentName(name: string): name is AgentName {
  return name in AGENTS;
}

export const AGENT_NAMES = Object.keys(AGENTS) as AgentName[];
export const AGENT_NAMES_STR = AGENT_NAMES.join(', ');

export type Scope = 'user' | 'project';

export const SKILL_DIR_NAME = 'lazy-tracker-cli';
export const SKILL_FILE_NAME = 'SKILL.md';

export function findGitRoot(dir: string): string | null {
  if (existsSync(resolve(dir, '.git'))) return dir;
  const parent = dirname(dir);
  return parent === dir ? null : findGitRoot(parent);
}

export function resolveInstallDir(agent: AgentName, scope: Scope, customDir?: string): string {
  if (customDir) {
    return resolve(customDir, SKILL_DIR_NAME);
  }

  const config = AGENTS[agent];

  if (scope === 'project') {
    const gitRoot = findGitRoot(process.cwd());
    if (!gitRoot) {
      throw new Error(
        'Git repository not found. Use --dir to specify a custom path, or run from within a git repository.'
      );
    }
    return resolve(gitRoot, config.skillsDir, SKILL_DIR_NAME);
  }

  return resolve(homedir(), config.skillsDir, SKILL_DIR_NAME);
}

export function resolveSkillPath(agent: AgentName, scope: Scope, customDir?: string): string {
  return resolve(resolveInstallDir(agent, scope, customDir), SKILL_FILE_NAME);
}
