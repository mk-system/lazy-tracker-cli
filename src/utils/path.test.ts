import { describe, expect, test } from 'bun:test';
import { encodePathSegment } from './path.js';

describe('encodePathSegment', () => {
  test('encodes characters that would change the request path', () => {
    expect(encodePathSegment('a/b?c#d')).toBe('a%2Fb%3Fc%23d');
  });

  test('rejects dot-segments', () => {
    expect(() => encodePathSegment('.')).toThrow('Invalid path segment: .');
    expect(() => encodePathSegment('..')).toThrow('Invalid path segment: ..');
  });

  test('accepts values that only contain dots among other characters', () => {
    expect(encodePathSegment('...')).toBe('...');
    expect(encodePathSegment('a.b')).toBe('a.b');
  });
});
