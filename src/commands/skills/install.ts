import { Command } from 'commander';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getSkillsContent } from './content.js';
import { success, info, error } from '../../utils/output.js';
import { AGENTS, AGENT_NAMES, resolveProjectRoot, type AgentName } from './agents.js';

const SKILL_DIR_NAME = 'lazy-tracker-cli';

export const installCommand = new Command('install')
  .description('Install CLI skills for a coding agent')
  .requiredOption('--agent <name>', `Target agent (${AGENT_NAMES})`)
  .option('--dry-run', 'Show what would be done without making changes')
  .action((options) => {
    const agentConfig = AGENTS[options.agent as AgentName];
    if (!agentConfig) {
      error(`Unknown agent: ${options.agent}`);
      console.error(`Valid agents: ${AGENT_NAMES}`);
      process.exit(1);
    }

    const base = resolveProjectRoot();
    const installDir = resolve(base, agentConfig.skillsDir, SKILL_DIR_NAME);
    const skillPath = resolve(installDir, 'SKILL.md');

    const newContent = getSkillsContent();

    if (existsSync(skillPath)) {
      const existing = readFileSync(skillPath, 'utf-8');
      if (existing === newContent) {
        info('Skills already up to date');
        return;
      }
    }

    if (options.dryRun) {
      info(`Would write to: ${skillPath}`);
      console.log(newContent);
      return;
    }

    mkdirSync(installDir, { recursive: true });
    writeFileSync(skillPath, newContent, 'utf-8');
    success(`Skills installed to ${skillPath}`);
  });
