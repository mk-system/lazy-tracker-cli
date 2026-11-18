import { api } from '../api/client.js';
import type { JpMkscLazytrackerApiModelsTagTagResponse as Tag } from '../api/__generated__/data-contracts.js';
import { CLIError } from '../utils/errors.js';

type TagRef = Pick<Tag, 'id' | 'name'>;

export function matchTagIds(tags: TagRef[], inputs: string[]): string[] {
  const ids: string[] = [];
  const unknown: string[] = [];

  for (const input of inputs) {
    // Names are matched before IDs, and IDs are not detected by pattern,
    // because the API spec does not guarantee any particular ID format.
    const byName = tags.filter((t) => t.name === input);
    if (byName.length > 1) {
      throw new CLIError(
        `Tag name "${input}" is ambiguous in this project. Specify the tag ID instead: ${byName.map((t) => t.id).join(', ')}`
      );
    }
    const match = byName[0] ?? tags.find((t) => t.id === input);
    if (match) {
      ids.push(match.id);
    } else {
      unknown.push(input);
    }
  }

  if (unknown.length > 0) {
    const hint =
      tags.length > 0
        ? `Available tags: ${tags.map((t) => t.name).join(', ')}`
        : 'This project has no tags.';
    throw new CLIError(`Unknown tag: ${unknown.join(', ')}. ${hint}`);
  }

  return [...new Set(ids)];
}

export async function resolveTagIds(
  team: string,
  project: string,
  inputs: string[]
): Promise<string[]> {
  const response = await api.v1TeamsProjectsTagsList(team, project);
  return matchTagIds(response.data, inputs);
}
