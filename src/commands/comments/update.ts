import { Command } from 'commander';
import { api } from '../../api/client.js';
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
      const response = await api.v1ChatsUpdate(chatId, { message: options.message });
      succeedSpinner('Comment updated');

      printJson({
        comment: response.data,
      });
    } catch (err) {
      failSpinner('Failed to update comment');
      console.error(formatError(err));
      process.exit(1);
    }
  });
