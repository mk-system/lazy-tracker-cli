import { AGENT_NAMES_STR, isAgentName, type AgentName, type Scope } from './agents.js';
import { isInteractive, selectAgent, selectScope } from './prompt.js';

export async function resolveAgent(agentOption?: string): Promise<AgentName> {
  if (agentOption) {
    if (!isAgentName(agentOption)) {
      throw new Error(`Unknown agent: ${agentOption}. Valid agents: ${AGENT_NAMES_STR}`);
    }
    return agentOption;
  }

  if (!isInteractive()) {
    throw new Error(
      `--agent is required in non-interactive mode. Valid agents: ${AGENT_NAMES_STR}`
    );
  }

  return selectAgent();
}

export async function resolveScope(
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
