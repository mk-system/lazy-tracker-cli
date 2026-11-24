import { describe, expect, test } from 'bun:test';
import { PassThrough } from 'node:stream';
import { confirm } from './confirm.js';

function ask(answer: (input: PassThrough) => void): Promise<boolean> {
  const input = new PassThrough();
  const result = confirm('Delete?', input, new PassThrough());
  answer(input);
  return result;
}

describe('confirm', () => {
  test('resolves true for "y"', async () => {
    expect(await ask((input) => input.write('y\n'))).toBe(true);
  });

  test('resolves true for "yes" regardless of case and spacing', async () => {
    expect(await ask((input) => input.write('  YES \n'))).toBe(true);
  });

  test('resolves false for any other answer', async () => {
    expect(await ask((input) => input.write('n\n'))).toBe(false);
  });

  test('resolves false when input closes without an answer', async () => {
    expect(await ask((input) => input.end())).toBe(false);
  });
});
