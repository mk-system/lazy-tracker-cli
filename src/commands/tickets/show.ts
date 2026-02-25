import { Command } from 'commander';
import { getTicketById, getTicketsByTeamAndProject, type Ticket } from '../../api/tickets.js';
import { printJson } from '../../utils/output.js';
import { startSpinner, succeedSpinner, failSpinner } from '../../utils/spinner.js';
import { formatError } from '../../utils/errors.js';
import { resolveTeamProject } from '../../config/project.js';

function isTicketNumber(value: string): boolean {
  return /^\d+$/.test(value);
}

async function fetchTicket(
  ticketIdOrNumber: string,
  options: { team?: string; project?: string }
): Promise<{ ticket: Ticket; context: { team?: string; project?: string } }> {
  if (isTicketNumber(ticketIdOrNumber)) {
    const resolved = resolveTeamProject({ team: options.team, project: options.project });
    if (!resolved) {
      failSpinner('Failed to fetch ticket');
      console.error(
        'Team and project are required for ticket number lookup. Create .lazy-tracker.json or specify --team and --project options.'
      );
      process.exit(1);
    }

    const context = { team: resolved.team, project: resolved.project };
    const tickets = await getTicketsByTeamAndProject(resolved.team, resolved.project);
    const ticketNumber = parseInt(ticketIdOrNumber, 10);
    const found = tickets.find((t) => t.ticketNumber === ticketNumber);

    if (!found) {
      failSpinner('Failed to fetch ticket');
      console.error(`Ticket #${ticketNumber} not found`);
      process.exit(1);
    }

    return { ticket: found, context };
  }

  return { ticket: await getTicketById(ticketIdOrNumber), context: {} };
}

export const showTicketCommand = new Command('show')
  .description('Show ticket details (JSON output)')
  .argument('<ticketIdOrNumber>', 'Ticket ID (UUID) or ticket number')
  .option('-t, --team <key>', 'Team key (required for ticket number)')
  .option('-p, --project <key>', 'Project key (required for ticket number)')
  .action(async (ticketIdOrNumber, options) => {
    startSpinner('Fetching ticket...');

    try {
      const { ticket, context } = await fetchTicket(ticketIdOrNumber, options);
      succeedSpinner('Ticket loaded');

      printJson({
        ...context,
        ticket,
      });
    } catch (err) {
      failSpinner('Failed to fetch ticket');
      console.error(formatError(err));
      process.exit(1);
    }
  });
