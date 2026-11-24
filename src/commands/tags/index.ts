import { Command } from 'commander';
import { listTagsCommand } from './list.js';
import { createTagCommand } from './create.js';

export const tagsCommand = new Command('tags')
  .description('Tag management commands')
  .addCommand(listTagsCommand)
  .addCommand(createTagCommand);
