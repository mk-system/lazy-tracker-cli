import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

interface AgentConfig {
  skillsDir: string;
}

export const AGENTS = {
  'claude-code': { skillsDir: '.claude/skills' },
  codex: { skillsDir: '.agents/skills' },
  copilot: { skillsDir: '.agents/skills' },
  cursor: { skillsDir: '.agents/skills' },
} as const satisfies Record<string, AgentConfig>;

export type AgentName = keyof typeof AGENTS;

export const AGENT_NAMES = Object.keys(AGENTS).join(', ');

export function findGitRoot(dir: string): string | null {
  if (existsSync(resolve(dir, '.git'))) return dir;
  const parent = dirname(dir);
  return parent === dir ? null : findGitRoot(parent);
}

export function resolveProjectRoot(): string {
  return findGitRoot(process.cwd()) ?? process.cwd();
}
