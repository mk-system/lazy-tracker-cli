import { Command } from 'commander';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getSkillsContent } from './content.js';
import { success, info, error } from '../../utils/output.js';
import {
  AGENTS,
  AGENT_NAMES_STR,
  SKILL_FILE_NAME,
  resolveInstallDir,
  type AgentName,
  type Scope,
} from './agents.js';
import { isInteractive, selectAgent, selectScope } from './prompt.js';

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

  // --agent flag provided without scope flags → default to user scope
  if (agentProvidedViaFlag) return { scope: 'user' };

  // Interactive mode (agent was also selected interactively)
  const result = await selectScope(agent);
  return { scope: result.scope, customDir: result.dir };
}
