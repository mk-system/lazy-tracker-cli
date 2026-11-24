import { createInterface } from 'node:readline';
import { stripControlChars } from './output.js';

export async function confirm(
  message: string,
  input: NodeJS.ReadableStream = process.stdin,
  output: NodeJS.WritableStream = process.stderr
): Promise<boolean> {
  const rl = createInterface({ input, output });

  return new Promise((resolve) => {
    rl.once('close', () => resolve(false));
    rl.question(`${stripControlChars(message)} (y/N): `, (answer) => {
      const normalized = answer.trim().toLowerCase();
      // rl.close() emits 'close' synchronously.
      resolve(normalized === 'y' || normalized === 'yes');
      rl.close();
    });
  });
}
