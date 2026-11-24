import { createInterface } from 'node:readline';

export async function confirm(message: string): Promise<boolean> {
  // Prompt on stderr: stdout is reserved for the command's JSON payload.
  const rl = createInterface({
    input: process.stdin,
    output: process.stderr,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === 'y' || normalized === 'yes');
    });
  });
}
