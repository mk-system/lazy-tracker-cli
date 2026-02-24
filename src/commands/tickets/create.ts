import { Command } from 'commander';
import {
  createTicket,
  type TicketCreateRequest,
  type TicketType,
  type TicketState,
  type TicketListType,
} from '../../api/tickets.js';
import { printJson } from '../../utils/output.js';
import { startSpinner, succeedSpinner, failSpinner } from '../../utils/spinner.js';
import { formatError, CLIError } from '../../utils/errors.js';
import { resolveTeamProject } from '../../config/project.js';

export const createTicketCommand = new Command('create')
  .description('Create a new ticket (JSON output)')
  .option('-t, --team <key>', 'Team key')
  .option('-p, --project <key>', 'Project key')
  .requiredOption('--title <title>', 'Ticket title')
  .option('-d, --description <text>', 'Ticket description')
  .option('--type <type>', 'Ticket type (normal, release)', 'normal')
  .option('--state <state>', 'Initial state (unscheduled, created, started)', 'created')
  .option('--list-type <type>', 'List type (done, current_backlog, icebox)', 'current_backlog')
  .option('--point <points>', 'Story points')
  .option('--release-date <date>', 'Release date (YYYY-MM-DD)')
  .action(async (options) => {
    const resolved = resolveTeamProject({ team: options.team, project: options.project });
    if (!resolved) {
      console.error(
        'Team and project are required. Create .lazy-tracker.json or specify --team and --project options.'
      );
      process.exit(1);
    }

    startSpinner('Creating ticket...');

    try {
      const validTypes: TicketType[] = ['normal', 'release'];
      if (!validTypes.includes(options.type)) {
        throw new CLIError(
          `Invalid ticket type: ${options.type}. Must be one of: ${validTypes.join(', ')}`
        );
      }

      const validStates: TicketState[] = ['unscheduled', 'created', 'started'];
      if (!validStates.includes(options.state)) {
        throw new CLIError(
          `Invalid initial state: ${options.state}. Must be one of: ${validStates.join(', ')}`
        );
      }

      const validListTypes: TicketListType[] = ['done', 'current_backlog', 'icebox'];
      if (!validListTypes.includes(options.listType)) {
        throw new CLIError(
          `Invalid list type: ${options.listType}. Must be one of: ${validListTypes.join(', ')}`
        );
      }

      const request: TicketCreateRequest = {
        title: options.title,
        description: options.description || '',
        ticketType: options.type as TicketType,
        state: options.state as TicketState,
        listType: options.listType as TicketListType,
        assigneeIds: [],
        tagIds: [],
      };

      if (options.point) {
        const point = parseInt(options.point, 10);
        if (isNaN(point) || point < 0) {
          throw new CLIError('Points must be a non-negative integer');
        }
        request.point = point;
      }

      if (options.releaseDate) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(options.releaseDate)) {
          throw new CLIError('Release date must be in YYYY-MM-DD format');
        }
        request.releaseDate = options.releaseDate;
      }

      const ticket = await createTicket(resolved.team, resolved.project, request);
      succeedSpinner('Ticket created');

      printJson({
        team: resolved.team,
        project: resolved.project,
        ticket,
      });
    } catch (err) {
      failSpinner('Failed to create ticket');
      console.error(formatError(err));
      process.exit(1);
    }
  });
