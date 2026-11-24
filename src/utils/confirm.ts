import { createInterface } from 'node:readline';
import { stripControlChars } from './output.js';

export async function confirm(message: string): Promise<boolean> {
  // Prompt on stderr: stdout is reserved for the command's JSON payload.
  const rl = createInterface({
    input: process.stdin,
    output: process.stderr,
  });

  return new Promise((resolve) => {
    rl.question(`${stripControlChars(message)} (y/N): `, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === 'y' || normalized === 'yes');
    });
  });
}
