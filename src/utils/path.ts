import { CLIError } from './errors.js';

export function encodePathSegment(value: string): string {
  // encodeURIComponent leaves dots alone, so these would still be resolved as dot-segments.
  if (value === '.' || value === '..') {
    throw new CLIError(`Invalid path segment: ${value}`);
  }
  return encodeURIComponent(value);
}
