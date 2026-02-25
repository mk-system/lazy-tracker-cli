import { Command } from 'commander';
import { listTicketsCommand } from './list.js';
import { showTicketCommand } from './show.js';
import { createTicketCommand } from './create.js';
import { updateTicketCommand } from './update.js';
import { deleteTicketCommand } from './delete.js';

export const ticketsCommand = new Command('tickets')
  .description('Ticket management commands')
  .addCommand(listTicketsCommand)
  .addCommand(showTicketCommand)
  .addCommand(createTicketCommand)
  .addCommand(updateTicketCommand)
  .addCommand(deleteTicketCommand);
