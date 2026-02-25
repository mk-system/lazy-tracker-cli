import { Command } from 'commander';
import { createInterface } from 'node:readline';
import { deleteTicket, getTicketsByTeamAndProject, getTicketById } from '../../api/tickets.js';
import { printJson } from '../../utils/output.js';
import { startSpinner, succeedSpinner, failSpinner } from '../../utils/spinner.js';
import { formatError } from '../../utils/errors.js';
import { resolveTeamProject } from '../../config/project.js';

function isTicketNumber(value: string): boolean {
  return /^\d+$/.test(value);
}

async function confirm(message: string): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function resolveTicket(
  ticketIdOrNumber: string,
  options: { team?: string; project?: string }
): Promise<{ id: string; title?: string }> {
  if (isTicketNumber(ticketIdOrNumber)) {
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
      return { id: found.id, title: found.title };
    } catch (err) {
      failSpinner('Failed to lookup ticket');
      console.error(formatError(err));
      process.exit(1);
    }
  }

  startSpinner('Fetching ticket details...');
  try {
    const ticket = await getTicketById(ticketIdOrNumber);
    succeedSpinner('Ticket found');
    return { id: ticketIdOrNumber, title: ticket.title };
  } catch (err) {
    failSpinner('Failed to fetch ticket');
    console.error(formatError(err));
    process.exit(1);
  }
}

export const deleteTicketCommand = new Command('delete')
  .description('Delete a ticket')
  .argument('<ticketIdOrNumber>', 'Ticket ID (UUID) or ticket number')
  .option('-t, --team <key>', 'Team key (required for ticket number)')
  .option('-p, --project <key>', 'Project key (required for ticket number)')
  .option('-f, --force', 'Skip confirmation')
  .action(async (ticketIdOrNumber, options) => {
    const { id: ticketId, title: ticketTitle } = await resolveTicket(ticketIdOrNumber, options);

    if (!options.force) {
      const displayTitle = ticketTitle ? ` "${ticketTitle}"` : '';
      const confirmed = await confirm(`Are you sure you want to delete ticket${displayTitle}?`);
      if (!confirmed) {
        console.log('Cancelled.');
        process.exit(0);
      }
    }

    startSpinner('Deleting ticket...');

    try {
      await deleteTicket(ticketId);
      succeedSpinner('Ticket deleted');

      printJson({
        deleted: true,
        ticketId,
      });
    } catch (err) {
      failSpinner('Failed to delete ticket');
      console.error(formatError(err));
      process.exit(1);
    }
  });
