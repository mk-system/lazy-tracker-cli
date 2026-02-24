import { Command } from 'commander';
import { updateChat } from '../../api/chats.js';
import { printJson } from '../../utils/output.js';
import { startSpinner, succeedSpinner, failSpinner } from '../../utils/spinner.js';
import { formatError } from '../../utils/errors.js';

export const updateCommentCommand = new Command('update')
  .description('Update a comment (JSON output)')
  .argument('<chatId>', 'Comment/Chat ID')
  .requiredOption('-m, --message <text>', 'New comment message')
  .action(async (chatId, options) => {
    startSpinner('Updating comment...');

    try {
      const chat = await updateChat(chatId, { message: options.message });
      succeedSpinner('Comment updated');

      printJson({
        comment: chat,
      });
    } catch (err) {
      failSpinner('Failed to update comment');
      console.error(formatError(err));
      process.exit(1);
    }
  });
