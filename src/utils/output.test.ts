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

describe('stripControlChars with Unicode format characters', () => {
  test('removes bidi overrides and isolates', () => {
    expect(stripControlChars('a‮b⁦c⁩')).toBe('abc');
  });

  test('removes zero-width spaces, direction marks, and line separators', () => {
    expect(stripControlChars('a​b‎c‏d e f')).toBe('abcdef');
  });

  test('keeps the zero-width joiner used by emoji sequences', () => {
    expect(stripControlChars('👨‍👩')).toBe('👨‍👩');
  });
});
