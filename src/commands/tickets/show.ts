import { Command } from 'commander';
import { printJson } from '../../utils/output.js';
import { startSpinner, succeedSpinner, failSpinner } from '../../utils/spinner.js';
import { formatError } from '../../utils/errors.js';
import { fetchTicket } from '../../config/ticket.js';

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

      await printJson({
        ...context,
        ticket,
      });
    } catch (err) {
      failSpinner('Failed to fetch ticket');
      console.error(formatError(err));
      process.exit(1);
    }
  });
