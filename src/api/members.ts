import { api } from './client.js';
import type { JpMkscLazytrackerApiModelsTicketTicketResponse as Ticket } from './__generated__/data-contracts.js';
import { warn } from '../utils/output.js';
import { formatError, CLIError } from '../utils/errors.js';

/** userId -> displayName */
export type MemberNameMap = Map<string, string>;

/** Ticket with display names resolved (assigneeIds / ownerId are kept for compatibility). */
export type AnnotatedTicket = Ticket & { assignees: string[]; owner: string | null };

export async function fetchTeamMembers(teamKey: string): Promise<MemberNameMap> {
  const response = await api.v1TeamsMembersList(teamKey);
  const members: MemberNameMap = new Map();
  for (const member of response.data) {
    members.set(member.userId, member.displayName);
  }
  return members;
}

export async function fetchProjectMembers(
  teamKey: string,
  projectKey: string
): Promise<MemberNameMap> {
  const response = await api.v1TeamsProjectsMembersList(teamKey, projectKey);
  const members: MemberNameMap = new Map();
  for (const member of response.data) {
    members.set(member.userId, member.displayName);
  }
  return members;
}

export async function fetchCurrentUserId(): Promise<string> {
  const response = await api.v1UserinfoList();
  return response.data.id;
}

/**
 * Resolves user IDs to display names via team member lists.
 * Caches one lookup per teamKey. Fetch failures degrade to raw IDs with a
 * warning instead of failing the listing itself.
 */
export class MemberDirectory {
  private cache = new Map<string, Promise<MemberNameMap | null>>();

  forTeam(teamKey: string): Promise<MemberNameMap | null> {
    let pending = this.cache.get(teamKey);
    if (!pending) {
      pending = fetchTeamMembers(teamKey).catch((err) => {
        warn(
          `Failed to fetch members of team "${teamKey}": ${formatError(err)}. ` +
            'User IDs are shown unresolved.'
        );
        return null;
      });
      this.cache.set(teamKey, pending);
    }
    return pending;
  }

  /** Exact displayName match across the given teams. */
  async findUserIdsByDisplayName(displayName: string, teamKeys: string[]): Promise<Set<string>> {
    const ids = new Set<string>();
    for (const teamKey of new Set(teamKeys)) {
      const members = await this.forTeam(teamKey);
      if (!members) continue;
      for (const [userId, name] of members) {
        if (name === displayName) ids.add(userId);
      }
    }
    return ids;
  }
}

export async function annotateTicket(
  ticket: Ticket,
  directory: MemberDirectory
): Promise<AnnotatedTicket> {
  const members = await directory.forTeam(ticket.teamKey);
  const resolve = (id: string): string => members?.get(id) ?? id;
  return {
    ...ticket,
    assignees: ticket.assigneeIds.map(resolve),
    owner: ticket.ownerId ? resolve(ticket.ownerId) : null,
  };
}

/**
 * Resolve --assignee names (comma-separated display names, or "me") to user IDs.
 * `members` is the member map of the target scope (project or team); pass null
 * when no scope is available — only "me" can be resolved in that case.
 */
export async function resolveAssigneeIds(
  assigneeOption: string | undefined,
  members: MemberNameMap | null
): Promise<string[] | undefined> {
  if (assigneeOption === undefined) return undefined;

  const names = assigneeOption
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
  if (names.length === 0) return undefined;

  const ids: string[] = [];
  for (const name of names) {
    if (name === 'me') {
      const myId = await fetchCurrentUserId();
      if (members && !members.has(myId)) {
        throw new CLIError('You are not a member of this project or team');
      }
      ids.push(myId);
      continue;
    }
    if (!members) {
      throw new CLIError(
        'Team and project are required to resolve assignee names. ' +
          'Create .lazy-tracker.json or specify --team and --project options.'
      );
    }
    const matched = [...members.entries()]
      .filter(([, displayName]) => displayName === name)
      .map(([id]) => id);
    if (matched.length === 0) {
      throw new CLIError(`No member named "${name}" found in this project or team`);
    }
    ids.push(...matched);
  }
  return [...new Set(ids)];
}
