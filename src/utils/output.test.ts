import { describe, expect, test } from 'bun:test';
import { stripControlChars } from './output.js';

describe('stripControlChars', () => {
  test('removes ESC so terminal escape sequences cannot take effect', () => {
    expect(stripControlChars('a\u001b[31mb')).toBe('a[31mb');
  });

  test('removes C0 controls including newlines and DEL', () => {
    expect(stripControlChars('a\nb\rc\td\u007fe')).toBe('abcde');
  });

  test('removes C1 controls', () => {
    expect(stripControlChars('a\u009bb')).toBe('ab');
  });

  test('keeps printable non-ASCII text', () => {
    expect(stripControlChars('バグ 修正')).toBe('バグ 修正');
  });
});
