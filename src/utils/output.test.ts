import { describe, expect, test } from 'bun:test';
import { stripControlChars } from './output.js';

describe('stripControlChars', () => {
  test('removes ESC so terminal escape sequences cannot take effect', () => {
    expect(stripControlChars('a\u001b[31mb')).toBe('a[31mb');
  });

  test('replaces tabs and line breaks with a space and removes other C0 controls and DEL', () => {
    expect(stripControlChars('a\nb\rc\td\u007fe')).toBe('a b c de');
  });

  test('replaces vertical tabs and form feeds with a space', () => {
    expect(stripControlChars('a\vb\fc')).toBe('a b c');
  });

  test('collapses a CRLF line break into a single space', () => {
    expect(stripControlChars('Backend API\r\nOwned by platform')).toBe(
      'Backend API Owned by platform'
    );
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

  test('removes zero-width spaces and direction marks', () => {
    expect(stripControlChars('a\u200bb\u200ec\u200fd')).toBe('abcd');
  });

  test('replaces line and paragraph separators and NEL with a space', () => {
    expect(stripControlChars('a\u2028b\u2029c\u0085d')).toBe('a b c d');
  });

  test('removes the Arabic letter mark, word joiners, invisible operators, and BOM', () => {
    expect(stripControlChars('a\u061cb\u2060c\u2064d\ufeffe')).toBe('abcde');
  });

  test('removes the soft hyphen and the Mongolian vowel separator', () => {
    expect(stripControlChars('a\u00adb\u180ec')).toBe('abc');
  });

  test('keeps the tag characters used by subdivision flag emoji', () => {
    const england = '\u{1f3f4}\u{e0067}\u{e0062}\u{e0065}\u{e006e}\u{e0067}\u{e007f}';
    expect(stripControlChars(england)).toBe(england);
  });

  test('keeps the zero-width joiner used by emoji sequences', () => {
    expect(stripControlChars('👨‍👩')).toBe('👨‍👩');
  });
});
