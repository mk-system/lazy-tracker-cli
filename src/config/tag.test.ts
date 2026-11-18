import { describe, expect, test } from 'bun:test';
import { matchTagIds } from './tag.js';

const TAGS = [
  { id: 'id-bug', name: 'bug' },
  { id: 'id-frontend', name: 'frontend' },
  { id: 'id-backend', name: 'backend' },
];

describe('matchTagIds', () => {
  test('resolves tag names to their IDs in the order given', () => {
    expect(matchTagIds(TAGS, ['frontend', 'bug'])).toEqual(['id-frontend', 'id-bug']);
  });

  test('accepts a tag ID when no tag has that name', () => {
    expect(matchTagIds(TAGS, ['id-backend'])).toEqual(['id-backend']);
  });

  test('prefers a name match over an ID match', () => {
    const tags = [
      { id: 'id-a', name: 'id-b' },
      { id: 'id-b', name: 'other' },
    ];
    expect(matchTagIds(tags, ['id-b'])).toEqual(['id-a']);
  });

  test('returns each tag once when it is specified more than once', () => {
    expect(matchTagIds(TAGS, ['bug', 'bug'])).toEqual(['id-bug']);
    expect(matchTagIds(TAGS, ['bug', 'id-bug', 'frontend'])).toEqual(['id-bug', 'id-frontend']);
  });

  test('rejects an unknown tag and lists the available tag names', () => {
    expect(() => matchTagIds(TAGS, ['bug', 'docs'])).toThrow(
      'Unknown tag: docs. Available tags: bug, frontend, backend'
    );
  });

  test('reports every unknown tag in one error', () => {
    expect(() => matchTagIds(TAGS, ['docs', 'bug', 'infra'])).toThrow('Unknown tag: docs, infra.');
  });

  test('rejects an unknown tag with a dedicated message when the project has no tags', () => {
    expect(() => matchTagIds([], ['bug'])).toThrow('Unknown tag: bug. This project has no tags.');
  });

  test('rejects a name shared by several tags and lists their IDs', () => {
    const tags = [
      { id: 'id-1', name: 'dup' },
      { id: 'id-2', name: 'dup' },
    ];
    expect(() => matchTagIds(tags, ['dup'])).toThrow(
      'Tag name "dup" is ambiguous in this project. Specify the tag ID instead: id-1, id-2'
    );
  });

  test('matches names case-sensitively', () => {
    expect(() => matchTagIds(TAGS, ['Bug'])).toThrow('Unknown tag: Bug.');
  });

  test('returns an empty list when no tags are requested', () => {
    expect(matchTagIds(TAGS, [])).toEqual([]);
  });
});
