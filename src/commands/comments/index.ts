import { Command } from 'commander';
import { listCommentsCommand } from './list.js';
import { addCommentCommand } from './add.js';
import { updateCommentCommand } from './update.js';
import { deleteCommentCommand } from './delete.js';

export const commentsCommand = new Command('comments')
  .description('Comment management commands')
  .addCommand(listCommentsCommand)
  .addCommand(addCommentCommand)
  .addCommand(updateCommentCommand)
  .addCommand(deleteCommentCommand);
