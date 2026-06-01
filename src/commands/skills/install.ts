import { Command } from 'commander';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getSkillsContent } from './content.js';
import { success, info } from '../../utils/output.js';
import { AGENT_NAMES_STR, SKILL_FILE_NAME, resolveInstallDir } from './agents.js';
import { resolveAgent, resolveScope } from './resolve.js';

export const installCommand = new Command('install')
  .description('Install CLI skills for a coding agent')
  .option('--agent <name>', `Target agent (${AGENT_NAMES_STR})`)
  .option('--project', 'Install to project scope (git root) instead of user scope')
  .option('--dir <path>', 'Install to a custom directory')
  .option('--dry-run', 'Show what would be done without making changes')
  .action(async (options) => {
    const agentProvidedViaFlag = !!options.agent;
    const agent = await resolveAgent(options.agent);
    const { scope, customDir } = await resolveScope(agent, options, agentProvidedViaFlag);

    const installDir = resolveInstallDir(agent, scope, customDir);
    const skillPath = resolve(installDir, SKILL_FILE_NAME);
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
