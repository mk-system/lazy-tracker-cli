import { Command } from 'commander';
import { createInterface } from 'node:readline';
import { api } from '../../api/client.js';
import { printJson } from '../../utils/output.js';
import { startSpinner, succeedSpinner, failSpinner } from '../../utils/spinner.js';
import { formatError } from '../../utils/errors.js';

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

export const deleteCommentCommand = new Command('delete')
  .description('Delete a comment')
  .argument('<chatId>', 'Comment/Chat ID')
  .option('-f, --force', 'Skip confirmation')
  .action(async (chatId, options) => {
    if (!options.force) {
      const confirmed = await confirm('Are you sure you want to delete this comment?');
      if (!confirmed) {
        console.log('Cancelled.');
        process.exit(0);
      }
    }

    startSpinner('Deleting comment...');

    try {
      await api.v1ChatsDelete(chatId);
      succeedSpinner('Comment deleted');

      printJson({
        deleted: true,
        chatId,
      });
    } catch (err) {
      failSpinner('Failed to delete comment');
      console.error(formatError(err));
      process.exit(1);
    }
  });
