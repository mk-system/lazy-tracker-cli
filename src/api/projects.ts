import { get } from './client.js';
import type { JpMkscLazytrackerApiModelsProjectProjectResponse as ProjectResponse } from './__generated__/data-contracts.js';

export type Project = ProjectResponse;

export async function getAllProjects(): Promise<Project[]> {
  return get<Project[]>('/projects');
}

export async function getRecentProjects(): Promise<Project[]> {
  return get<Project[]>('/projects/recent');
}

export async function getProjectsByTeamKey(teamKey: string): Promise<Project[]> {
  return get<Project[]>(`/projects/team/${teamKey}`);
}

export async function getProjectByKey(projectKey: string): Promise<Project> {
  return get<Project>(`/projects/key/${projectKey}`);
}

export async function getProjectByKeys(teamKey: string, projectKey: string): Promise<Project> {
  return get<Project>(`/teams/${teamKey}/projects/${projectKey}`);
}
