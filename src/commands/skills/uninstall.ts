import { Command } from 'commander';
import { existsSync, readdirSync, rmSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { success, info, warn, error } from '../../utils/output.js';
import {
  AGENTS,
  AGENT_NAMES_STR,
  SKILL_FILE_NAME,
  resolveInstallDir,
  type AgentName,
  type Scope,
} from './agents.js';
import { isInteractive, selectAgent, selectScope, confirm } from './prompt.js';

export const uninstallCommand = new Command('uninstall')
  .description('Remove CLI skills for a coding agent')
  .option('--agent <name>', `Target agent (${AGENT_NAMES_STR})`)
  .option('--project', 'Uninstall from project scope (git root) instead of user scope')
  .option('--dir <path>', 'Uninstall from a custom directory')
  .option('--dry-run', 'Show what would be removed without making changes')
  .action(async (options) => {
    const agentProvidedViaFlag = !!options.agent;
    const agent = await resolveAgent(options.agent);
    const { scope, customDir } = await resolveScope(agent, options, agentProvidedViaFlag);

    const installDir = resolveInstallDir(agent, scope, customDir);
    const skillPath = resolve(installDir, SKILL_FILE_NAME);

    if (!existsSync(installDir)) {
      info(`No lt skills found for ${agent}`);
      return;
    }

    if (options.dryRun) {
      if (existsSync(skillPath)) {
        info(`Would remove: ${skillPath}`);
        const entries = readdirSync(installDir);
        if (entries.length === 1 && entries[0] === SKILL_FILE_NAME) {
          info(`Would remove directory: ${installDir}`);
        }
      } else {
        info(`No skill file found at ${skillPath}`);
      }
      return;
    }

    if (isInteractive()) {
      const confirmed = await confirm(`Remove ${skillPath}?`);
      if (!confirmed) {
        info('Cancelled');
        return;
      }
    }

    const entries = readdirSync(installDir);
    if (entries.length > 1 || (entries.length === 1 && entries[0] !== SKILL_FILE_NAME)) {
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

async function resolveAgent(agentOption?: string): Promise<AgentName> {
  if (agentOption) {
    const config = AGENTS[agentOption as AgentName];
    if (!config) {
      error(`Unknown agent: ${agentOption}`);
      console.error(`Valid agents: ${AGENT_NAMES_STR}`);
      process.exit(1);
    }
    return agentOption as AgentName;
  }

  if (!isInteractive()) {
    error('--agent is required in non-interactive mode');
    console.error(`Valid agents: ${AGENT_NAMES_STR}`);
    process.exit(1);
  }

  return selectAgent();
}

async function resolveScope(
  agent: AgentName,
  options: { project?: boolean; dir?: string },
  agentProvidedViaFlag: boolean
): Promise<{ scope: Scope; customDir?: string }> {
  if (options.dir) return { scope: 'user', customDir: options.dir };
  if (options.project) return { scope: 'project' };

  if (agentProvidedViaFlag) return { scope: 'user' };

  const result = await selectScope(agent);
  return { scope: result.scope, customDir: result.dir };
}
