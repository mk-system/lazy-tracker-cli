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
