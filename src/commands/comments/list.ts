import { Command } from 'commander';
import { getChatsByTicket } from '../../api/chats.js';
import { printJson } from '../../utils/output.js';
import { startSpinner, succeedSpinner, failSpinner } from '../../utils/spinner.js';
import { formatError } from '../../utils/errors.js';

export const listCommentsCommand = new Command('list')
  .description('List comments on a ticket (JSON output)')
  .argument('<ticketId>', 'Ticket ID')
  .action(async (ticketId) => {
    startSpinner('Fetching comments...');

    try {
      const chats = await getChatsByTicket(ticketId);
      succeedSpinner(`Found ${chats.length} comment(s)`);

      printJson({
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
