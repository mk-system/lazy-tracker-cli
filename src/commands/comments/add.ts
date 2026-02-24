import { Command } from 'commander';
import { createChat } from '../../api/chats.js';
import { printJson } from '../../utils/output.js';
import { startSpinner, succeedSpinner, failSpinner } from '../../utils/spinner.js';
import { formatError } from '../../utils/errors.js';

export const addCommentCommand = new Command('add')
  .description('Add a comment to a ticket (JSON output)')
  .argument('<ticketId>', 'Ticket ID')
  .requiredOption('-m, --message <text>', 'Comment message')
  .action(async (ticketId, options) => {
    startSpinner('Adding comment...');

    try {
      const chat = await createChat(ticketId, { message: options.message });
      succeedSpinner('Comment added');

      printJson({
        ticketId,
        comment: chat,
      });
    } catch (err) {
      failSpinner('Failed to add comment');
      console.error(formatError(err));
      process.exit(1);
    }
  });
