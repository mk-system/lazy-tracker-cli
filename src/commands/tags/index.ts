import { Command } from 'commander';
import { listTagsCommand } from './list.js';
import { createTagCommand } from './create.js';
import { updateTagCommand } from './update.js';
import { deleteTagCommand } from './delete.js';

export const tagsCommand = new Command('tags')
  .description('Tag management commands')
  .addCommand(listTagsCommand)
  .addCommand(createTagCommand)
  .addCommand(updateTagCommand)
  .addCommand(deleteTagCommand);
