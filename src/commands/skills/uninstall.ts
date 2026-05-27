import { Command } from 'commander';
import { existsSync, readdirSync, rmSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { success, info, warn, error } from '../../utils/output.js';
import { AGENTS, AGENT_NAMES, resolveProjectRoot, type AgentName } from './agents.js';

const SKILL_DIR_NAME = 'lazy-tracker-cli';
const SKILL_FILE_NAME = 'SKILL.md';

export const uninstallCommand = new Command('uninstall')
  .description('Remove CLI skills for a coding agent')
  .requiredOption('--agent <name>', `Target agent (${AGENT_NAMES})`)
  .action((options) => {
    const agentConfig = AGENTS[options.agent as AgentName];
    if (!agentConfig) {
      error(`Unknown agent: ${options.agent}`);
      console.error(`Valid agents: ${AGENT_NAMES}`);
      process.exit(1);
    }

    const base = resolveProjectRoot();
    const installDir = resolve(base, agentConfig.skillsDir, SKILL_DIR_NAME);
    const skillPath = resolve(installDir, SKILL_FILE_NAME);

    if (!existsSync(installDir)) {
      info(`No lt skills found for ${options.agent}`);
      return;
    }

    const entries = readdirSync(installDir);
    if (entries.length > 1 || (entries.length === 1 && entries[0] !== SKILL_FILE_NAME)) {
      // Directory contains files other than SKILL.md — only remove SKILL.md
      if (existsSync(skillPath)) {
        unlinkSync(skillPath);
        success(`Removed ${skillPath}`);
      }
      warn(`Directory ${installDir} contains other files, kept intact`);
      return;
    }

    rmSync(installDir, { recursive: true, force: true });
    success(`Removed ${installDir}`);
  });
