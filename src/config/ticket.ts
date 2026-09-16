import { api } from '../api/client.js';
import type { JpMkscLazytrackerApiModelsTicketTicketResponse as Ticket } from '../api/__generated__/data-contracts.js';
import { CLIError } from '../utils/errors.js';
import { resolveTeamProject } from './project.js';

export interface TicketContext {
  team?: string;
  project?: string;
}

function isTicketNumber(value: string): boolean {
  return /^\d+$/.test(value);
}

export async function fetchTicket(
  ticketIdOrNumber: string,
  options: TicketContext
): Promise<{ ticket: Ticket; context: TicketContext }> {
  if (!isTicketNumber(ticketIdOrNumber)) {
    const response = await api.v1TicketsDetail(ticketIdOrNumber);
    return { ticket: response.data, context: {} };
  }

  const resolved = resolveTeamProject(options);
  if (!resolved) {
    throw new CLIError(
      'Team and project are required for ticket number lookup. Create .lazy-tracker.json or specify --team and --project options.'
    );
  }

  const response = await api.v1TeamsProjectsTicketsByNumberDetail(
    resolved.team,
    resolved.project,
    ticketIdOrNumber
  );
  return { ticket: response.data, context: resolved };
}

/**
 * Ticket numbers are only unique within a project, so the API exposes chats
 * under the ticket UUID alone. Resolve the number to its UUID before use.
 */
export async function resolveTicketId(
  ticketIdOrNumber: string,
  options: TicketContext
): Promise<{ ticketId: string; context: TicketContext }> {
  if (!isTicketNumber(ticketIdOrNumber)) {
    return { ticketId: ticketIdOrNumber, context: {} };
  }

  const { ticket, context } = await fetchTicket(ticketIdOrNumber, options);
  return { ticketId: ticket.id, context };
}
