import { createInterface } from 'node:readline';
import { resolve } from 'node:path';
import { homedir } from 'node:os';
import {
  AGENTS,
  AGENT_NAMES,
  SKILL_DIR_NAME,
  SKILL_FILE_NAME,
  findGitRoot,
  type AgentName,
  type Scope,
} from './agents.js';

function question(prompt: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((res) => {
    rl.question(prompt, (answer) => {
      rl.close();
      res(answer.trim());
    });
  });
}

export function isInteractive(): boolean {
  return process.stdin.isTTY === true;
}

export async function selectAgent(): Promise<AgentName> {
  const choices = AGENT_NAMES.map((name, i) => `${i + 1}:${name}`).join(', ');
  const answer = await question(`? Select agent [${choices}]: `);

  const index = parseInt(answer, 10) - 1;
  if (index >= 0 && index < AGENT_NAMES.length) return AGENT_NAMES[index]!;

  if (AGENT_NAMES.includes(answer as AgentName)) return answer as AgentName;

  throw new Error(`Invalid selection: ${answer}`);
}

export async function selectScope(agent: AgentName): Promise<{ scope: Scope; dir?: string }> {
  const config = AGENTS[agent];
  const userPath = resolve(homedir(), config.skillsDir, SKILL_DIR_NAME, SKILL_FILE_NAME);
  const gitRoot = findGitRoot(process.cwd());
  const projectPath = gitRoot
    ? resolve(gitRoot, config.skillsDir, SKILL_DIR_NAME, SKILL_FILE_NAME)
    : null;

  console.log(`  1: user    ${userPath}`);
  if (projectPath) {
    console.log(`  2: project ${projectPath}`);
    console.log('  3: custom path');
  } else {
    console.log('  2: custom path');
  }

  const answer = await question('? Install to: ');

  if (answer === '1' || answer === 'user') return { scope: 'user' };

  if (projectPath) {
    if (answer === '2' || answer === 'project') return { scope: 'project' };
    if (answer === '3' || answer === 'custom') {
      const dir = await question('? Path: ');
      return { scope: 'user', dir };
    }
  } else {
    if (answer === '2' || answer === 'custom') {
      const dir = await question('? Path: ');
      return { scope: 'user', dir };
    }
  }

  throw new Error(`Invalid selection: ${answer}`);
}

export async function confirm(message: string): Promise<boolean> {
  const answer = await question(`${message} (y/N): `);
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}
