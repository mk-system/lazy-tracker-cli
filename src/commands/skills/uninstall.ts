import { Command } from 'commander';
import { existsSync, readdirSync, rmSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { success, info, warn } from '../../utils/output.js';
import { AGENT_NAMES_STR, SKILL_FILE_NAME, resolveInstallDir } from './agents.js';
import { isInteractive, confirm } from './prompt.js';
import { resolveAgent, resolveScope } from './resolve.js';

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

    if (!existsSync(skillPath)) {
      info(`No skill file found at ${skillPath}`);
      return;
    }

    if (options.dryRun) {
      info(`Would remove: ${skillPath}`);
      const entries = readdirSync(installDir);
      if (entries.length === 1 && entries[0] === SKILL_FILE_NAME) {
        info(`Would remove directory: ${installDir}`);
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
      unlinkSync(skillPath);
      success(`Removed ${skillPath}`);
      warn(`Directory ${installDir} contains other files, kept intact`);
      return;
    }

    rmSync(installDir, { recursive: true, force: true });
    success(`Removed ${installDir}`);
  });
