import { describe, expect, test } from 'bun:test';
import { normalizeTagName } from './resolve.js';

describe('normalizeTagName', () => {
  test('trims surrounding whitespace', () => {
    expect(normalizeTagName('  bug  ')).toBe('bug');
  });

  test('rejects an empty or whitespace-only name', () => {
    expect(() => normalizeTagName('')).toThrow('Tag name cannot be empty');
    expect(() => normalizeTagName('   ')).toThrow('Tag name cannot be empty');
  });

  test('accepts a 255-character name and rejects a 256-character one', () => {
    expect(normalizeTagName('a'.repeat(255))).toBe('a'.repeat(255));
    expect(() => normalizeTagName('a'.repeat(256))).toThrow(
      'Tag name cannot exceed 255 characters'
    );
  });
});
