import { get } from './client.js';
import type {
  JpMkscLazytrackerApiModelsTeamTeamResponse as TeamResponse,
  JpMkscLazytrackerApiModelsTeamTeamMemberResponse as TeamMemberResponse,
} from './__generated__/data-contracts.js';

export type Team = TeamResponse;
export type TeamMember = TeamMemberResponse;

export async function getMyTeams(): Promise<Team[]> {
  return get<Team[]>('/teams/my');
}

export async function getAllTeams(): Promise<Team[]> {
  return get<Team[]>('/teams');
}

export async function getTeamByKey(teamKey: string): Promise<Team> {
  return get<Team>(`/teams/${teamKey}`);
}

export async function getTeamMembers(teamKey: string): Promise<TeamMember[]> {
  return get<TeamMember[]>(`/teams/${teamKey}/members`);
}
