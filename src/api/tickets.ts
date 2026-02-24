import { get, post, put, del } from './client.js';
import type {
  JpMkscLazytrackerApiModelsTicketTicketResponse as TicketResponse,
  JpMkscLazytrackerApiModelsTicketTicketCreateRequest as TicketCreateRequestGenerated,
  JpMkscLazytrackerApiModelsTicketTicketUpdateRequest as TicketUpdateRequestGenerated,
  JpMkscLazytrackerApiModelsCommonTicketStateEnum,
  JpMkscLazytrackerApiModelsCommonTicketTypeEnum,
  JpMkscLazytrackerApiModelsCommonTicketListTypeEnum,
} from './__generated__/data-contracts.js';

export type TicketState = JpMkscLazytrackerApiModelsCommonTicketStateEnum;
export type TicketType = JpMkscLazytrackerApiModelsCommonTicketTypeEnum;
export type TicketListType = JpMkscLazytrackerApiModelsCommonTicketListTypeEnum;

export type Ticket = TicketResponse;

export type TicketCreateRequest = Partial<TicketCreateRequestGenerated>;
export type TicketUpdateRequest = TicketUpdateRequestGenerated;

export async function getMyTickets(): Promise<Ticket[]> {
  return get<Ticket[]>('/tickets');
}

export async function getTicketsByProject(projectId: string): Promise<Ticket[]> {
  return get<Ticket[]>(`/projects/${projectId}/tickets`);
}

export async function getTicketsByTeam(teamKey: string): Promise<Ticket[]> {
  return get<Ticket[]>(`/teams/${teamKey}/tickets`);
}

export async function getTicketsByTeamAndProject(
  teamKey: string,
  projectKey: string
): Promise<Ticket[]> {
  return get<Ticket[]>(`/teams/${teamKey}/projects/${projectKey}/tickets`);
}

export async function getTicketById(ticketId: string): Promise<Ticket> {
  return get<Ticket>(`/tickets/${ticketId}`);
}

export async function createTicket(
  teamKey: string,
  projectKey: string,
  data: TicketCreateRequest
): Promise<Ticket> {
  return post<Ticket>(`/teams/${teamKey}/projects/${projectKey}/tickets`, data);
}

export async function updateTicket(ticketId: string, data: TicketUpdateRequest): Promise<Ticket> {
  return put<Ticket>(`/tickets/${ticketId}`, data);
}

export async function deleteTicket(ticketId: string): Promise<void> {
  return del<void>(`/tickets/${ticketId}`);
}
