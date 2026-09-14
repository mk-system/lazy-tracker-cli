import { Command } from 'commander';
import { api } from '../../api/client.js';
import { printJson } from '../../utils/output.js';
import { startSpinner, succeedSpinner, failSpinner } from '../../utils/spinner.js';
import { formatError } from '../../utils/errors.js';
import { resolveTicketId } from '../../config/ticket.js';

export const listCommentsCommand = new Command('list')
  .description('List comments on a ticket (JSON output)')
  .argument('<ticketIdOrNumber>', 'Ticket ID (UUID) or ticket number')
  .option('-t, --team <key>', 'Team key (required for ticket number)')
  .option('-p, --project <key>', 'Project key (required for ticket number)')
  .action(async (ticketIdOrNumber, options) => {
    startSpinner('Fetching comments...');

    try {
      const { ticketId, context } = await resolveTicketId(ticketIdOrNumber, options);
      const response = await api.v1TicketsChatsList(ticketId);
      const chats = response.data;
      succeedSpinner(`Found ${chats.length} comment(s)`);

      await printJson({
        ...context,
        ticketId,
        count: chats.length,
        comments: chats,
      });
    } catch (err) {
      failSpinner('Failed to fetch comments');
      console.error(formatError(err));
      process.exit(1);
    }
  });
