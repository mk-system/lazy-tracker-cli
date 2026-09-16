import { Command } from 'commander';
import { api } from '../../api/client.js';
import { printJson } from '../../utils/output.js';
import { startSpinner, succeedSpinner, failSpinner, updateSpinner } from '../../utils/spinner.js';
import { formatError } from '../../utils/errors.js';
import { resolveTicketId, type TicketContext } from '../../config/ticket.js';

export const addCommentCommand = new Command('add')
  .description('Add a comment to a ticket (JSON output)')
  .argument('<ticketIdOrNumber>', 'Ticket ID (UUID) or ticket number')
  .requiredOption('-m, --message <text>', 'Comment message')
  .option('-t, --team <key>', 'Team key (required for ticket number)')
  .option('-p, --project <key>', 'Project key (required for ticket number)')
  .action(async (ticketIdOrNumber, options) => {
    startSpinner('Resolving ticket...');

    // Report resolution failures separately so a failed lookup is never read as
    // "the comment may have been posted".
    let resolved: { ticketId: string; context: TicketContext };
    try {
      resolved = await resolveTicketId(ticketIdOrNumber, options);
    } catch (err) {
      failSpinner('Failed to resolve ticket');
      console.error(formatError(err));
      process.exit(1);
    }

    const { ticketId, context } = resolved;
    updateSpinner('Adding comment...');

    try {
      const response = await api.v1TicketsChatsCreate(ticketId, { message: options.message });
      succeedSpinner('Comment added');

      await printJson({
        ...context,
        ticketId,
        comment: response.data,
      });
    } catch (err) {
      failSpinner('Failed to add comment');
      console.error(formatError(err));
      process.exit(1);
    }
  });
