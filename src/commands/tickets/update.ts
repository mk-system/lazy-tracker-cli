import { Command } from 'commander';
import {
  updateTicket,
  getTicketsByTeamAndProject,
  type TicketUpdateRequest,
  type TicketState,
} from '../../api/tickets.js';
import { printJson } from '../../utils/output.js';
import { startSpinner, succeedSpinner, failSpinner } from '../../utils/spinner.js';
import { formatError } from '../../utils/errors.js';
import { resolveTeamProject } from '../../config/project.js';

function isTicketNumber(value: string): boolean {
  return /^\d+$/.test(value);
}

async function resolveTicketId(
  ticketIdOrNumber: string,
  options: { team?: string; project?: string }
): Promise<string> {
  if (!isTicketNumber(ticketIdOrNumber)) {
    return ticketIdOrNumber;
  }

  const resolved = resolveTeamProject({ team: options.team, project: options.project });
  if (!resolved) {
    console.error(
      'Team and project are required for ticket number lookup. Create .lazy-tracker.json or specify --team and --project options.'
    );
    process.exit(1);
  }

  startSpinner('Looking up ticket...');
  try {
    const tickets = await getTicketsByTeamAndProject(resolved.team, resolved.project);
    const ticketNumber = parseInt(ticketIdOrNumber, 10);
    const found = tickets.find((t) => t.ticketNumber === ticketNumber);

    if (!found) {
      failSpinner('Ticket not found');
      console.error(`Ticket #${ticketNumber} not found`);
      process.exit(1);
    }

    succeedSpinner(`Found ticket #${ticketNumber}`);
    return found.id;
  } catch (err) {
    failSpinner('Failed to lookup ticket');
    console.error(formatError(err));
    process.exit(1);
  }
}

function buildUpdateRequest(options: {
  title?: string;
  description?: string;
  state?: string;
  point?: string;
  releaseDate?: string;
}): TicketUpdateRequest | null {
  const request: TicketUpdateRequest = {};
  const fields: Array<() => void> = [];

  if (options.title !== undefined) {
    fields.push(() => {
      request.title = options.title;
    });
  }

  if (options.description !== undefined) {
    fields.push(() => {
      request.description = options.description;
    });
  }

  if (options.state !== undefined) {
    const validStates: TicketState[] = [
      'created',
      'started',
      'finished',
      'delivered',
      'accepted',
      'rejected',
    ];
    if (!validStates.includes(options.state as TicketState)) {
      console.error(`Invalid state: ${options.state}. Must be one of: ${validStates.join(', ')}`);
      process.exit(1);
    }
    fields.push(() => {
      request.state = options.state as TicketState;
    });
  }

  if (options.point !== undefined) {
    if (options.point === 'null') {
      fields.push(() => {
        request.point = null;
      });
    } else {
      const point = parseInt(options.point, 10);
      if (isNaN(point) || point < 0) {
        console.error('Points must be a non-negative integer or "null"');
        process.exit(1);
      }
      fields.push(() => {
        request.point = point;
      });
    }
  }

  if (options.releaseDate !== undefined) {
    if (options.releaseDate === 'null') {
      fields.push(() => {
        request.releaseDate = null;
      });
    } else {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(options.releaseDate)) {
        console.error('Release date must be in YYYY-MM-DD format or "null"');
        process.exit(1);
      }
      fields.push(() => {
        request.releaseDate = options.releaseDate;
      });
    }
  }

  if (fields.length === 0) {
    return null;
  }

  fields.forEach((apply) => apply());
  return request;
}

export const updateTicketCommand = new Command('update')
  .description('Update a ticket (JSON output)')
  .argument('<ticketIdOrNumber>', 'Ticket ID (UUID) or ticket number')
  .option('-t, --team <key>', 'Team key (required for ticket number)')
  .option('-p, --project <key>', 'Project key (required for ticket number)')
  .option('--title <title>', 'New title')
  .option('-d, --description <text>', 'New description')
  .option(
    '--state <state>',
    'New state (created, started, finished, delivered, accepted, rejected)'
  )
  .option('--point <points>', 'New story points (use "null" to clear)')
  .option('--release-date <date>', 'New release date (YYYY-MM-DD, use "null" to clear)')
  .action(async (ticketIdOrNumber, options) => {
    const request = buildUpdateRequest(options);
    if (!request) {
      console.error('No changes specified. Use --help to see available options.');
      process.exit(1);
    }

    const ticketId = await resolveTicketId(ticketIdOrNumber, options);

    startSpinner('Updating ticket...');

    try {
      const ticket = await updateTicket(ticketId, request);
      succeedSpinner('Ticket updated');

      printJson({ ticket });
    } catch (err) {
      failSpinner('Failed to update ticket');
      console.error(formatError(err));
      process.exit(1);
    }
  });
