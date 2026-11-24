import { describe, expect, test } from 'bun:test';
import { assertTagNameAvailable, matchTag, normalizeTagName } from './resolve.js';

const bug = { id: 'a1b2c3d4-0000-0000-0000-000000000001', name: 'bug' };
const feature = { id: 'a1b2c3d4-0000-0000-0000-000000000002', name: 'feature' };

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

describe('matchTag', () => {
  test('returns the tag whose name matches', () => {
    expect(matchTag([bug, feature], 'feature')).toBe(feature);
  });

  test('returns the tag whose ID matches when no name does', () => {
    expect(matchTag([bug, feature], bug.id)).toBe(bug);
  });

  test('rejects input that matches one tag by name and another by ID', () => {
    const namedLikeId = { id: 'a1b2c3d4-0000-0000-0000-000000000003', name: bug.id };
    expect(() => matchTag([bug, namedLikeId], bug.id)).toThrow(`Ambiguous tag: ${bug.id}`);
  });

  test('accepts a tag whose name equals its own ID', () => {
    const self = {
      id: 'a1b2c3d4-0000-0000-0000-000000000004',
      name: 'a1b2c3d4-0000-0000-0000-000000000004',
    };
    expect(matchTag([self], self.id)).toBe(self);
  });

  test('matches names case-sensitively', () => {
    expect(() => matchTag([bug], 'Bug')).toThrow('Unknown tag: Bug');
  });

  test('rejects an unknown tag and lists the available tag names', () => {
    expect(() => matchTag([bug, feature], 'chore')).toThrow(
      'Unknown tag: chore. Available tags: bug, feature'
    );
  });

  test('strips control characters from the available tag names', () => {
    const spoofed = { id: 'a1b2c3d4-0000-0000-0000-000000000005', name: 'evil\u001b[2Jname' };
    expect(() => matchTag([spoofed], 'chore')).toThrow(
      'Unknown tag: chore. Available tags: evil[2Jname'
    );
  });

  test('rejects an unknown tag with a dedicated message when the project has no tags', () => {
    expect(() => matchTag([], 'bug')).toThrow('Unknown tag: bug. This project has no tags.');
  });
});

describe('assertTagNameAvailable', () => {
  test('passes when no tag has the name', () => {
    expect(() => assertTagNameAvailable([bug, feature], 'chore')).not.toThrow();
  });

  test('rejects a name that another tag already uses', () => {
    expect(() => assertTagNameAvailable([bug, feature], 'feature')).toThrow(
      'A tag named "feature" already exists in this project.'
    );
  });

  test('rejects renaming a tag to its current name', () => {
    expect(() => assertTagNameAvailable([bug], 'bug')).toThrow(
      'A tag named "bug" already exists in this project.'
    );
  });
});
