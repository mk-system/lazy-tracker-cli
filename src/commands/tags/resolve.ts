import type { JpMkscLazytrackerApiModelsTagTagResponse as Tag } from '../../api/__generated__/data-contracts.js';
import { CLIError } from '../../utils/errors.js';

const MAX_TAG_NAME_LENGTH = 255;

export function normalizeTagName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throw new CLIError('Tag name cannot be empty');
  }
  if (trimmed.length > MAX_TAG_NAME_LENGTH) {
    throw new CLIError(`Tag name cannot exceed ${MAX_TAG_NAME_LENGTH} characters`);
  }
  return trimmed;
}

type TagRef = Pick<Tag, 'id' | 'name'>;

export function matchTag<T extends TagRef>(tags: T[], input: string): T {
  const byName = tags.find((t) => t.name === input);
  const byId = tags.find((t) => t.id === input);
  if (byName && byId && byName !== byId) {
    throw new CLIError(`Ambiguous tag: ${input} matches one tag by name and another by ID.`);
  }
  const tag = byName ?? byId;
  if (tag) {
    return tag;
  }
  if (tags.length === 0) {
    throw new CLIError(`Unknown tag: ${input}. This project has no tags.`);
  }
  throw new CLIError(
    `Unknown tag: ${input}. Available tags: ${tags.map((t) => t.name).join(', ')}`
  );
}

export function assertTagNameAvailable(tags: TagRef[], name: string): void {
  if (tags.some((t) => t.name === name)) {
    throw new CLIError(`A tag named "${name}" already exists in this project.`);
  }
}
