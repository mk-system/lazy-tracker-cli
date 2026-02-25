import { Command } from 'commander';
import { api } from '../../api/client.js';
import type {
  JpMkscLazytrackerApiModelsTicketTicketResponse as Ticket,
  JpMkscLazytrackerApiModelsCommonTicketStateEnum as TicketState,
  JpMkscLazytrackerApiModelsCommonTicketListTypeEnum as TicketListType,
} from '../../api/__generated__/data-contracts.js';
import { printJson, warn } from '../../utils/output.js';
import { startSpinner, succeedSpinner, failSpinner } from '../../utils/spinner.js';
import { formatError } from '../../utils/errors.js';
import { resolveTeamProject } from '../../config/project.js';

const DEFAULT_COLUMNS = ['ticketNumber', 'title', 'state', 'projectKey', 'teamKey'];

function printTable(tickets: Ticket[], columns: string[]): void {
  if (tickets.length === 0) {
    console.log('No tickets found.');
    return;
  }

  const columnLabels: Record<string, string> = {
    id: 'ID',
    ticketNumber: '#',
    title: 'Title',
    state: 'State',
    listType: 'List Type',
    point: 'Points',
    projectKey: 'Project',
    teamKey: 'Team',
    ticketType: 'Type',
  };

  const getColumnValue = (ticket: Ticket, col: string): string => {
    switch (col) {
      case 'id':
        return ticket.id;
      case 'ticketNumber':
        return String(ticket.ticketNumber);
      case 'title':
        return ticket.title.length > 50 ? ticket.title.substring(0, 47) + '...' : ticket.title;
      case 'state':
        return ticket.state;
      case 'listType':
        return ticket.listType;
      case 'point':
        return ticket.point != null ? String(ticket.point) : '-';
      case 'projectKey':
        return ticket.projectKey;
      case 'teamKey':
        return ticket.teamKey;
      case 'ticketType':
        return ticket.ticketType;
      default:
        return '-';
    }
  };

  const widths: number[] = columns.map((col) => {
    const label = columnLabels[col] || col;
    const maxValue = Math.max(...tickets.map((t) => getColumnValue(t, col).length));
    return Math.max(label.length, maxValue);
  });

  const header = columns.map((col, i) => (columnLabels[col] || col).padEnd(widths[i])).join('  ');
  const separator = widths.map((w) => '-'.repeat(w)).join('  ');

  console.log(header);
  console.log(separator);

  for (const ticket of tickets) {
    const row = columns.map((col, i) => getColumnValue(ticket, col).padEnd(widths[i])).join('  ');
    console.log(row);
  }
}

export const listTicketsCommand = new Command('list')
  .description('List tickets (JSON output by default)')
  .option('-t, --team <key>', 'Filter by team key')
  .option('-p, --project <key>', 'Filter by project key (requires --team)')
  .option(
    '-s, --state <state>',
    'Filter by state (unscheduled, created, started, finished, delivered, accepted, rejected)'
  )
  .option('--list-type <type>', 'Filter by list type (done, current_backlog, icebox)')
  .option('--table', 'Display as table instead of JSON')
  .option(
    '--columns <cols>',
    'Comma-separated columns for table (default: ticketNumber,title,state,projectKey,teamKey)'
  )
  .action(async (options) => {
    const resolved = resolveTeamProject({ team: options.team, project: options.project });

    if (!resolved && options.project && !options.team) {
      warn('--project requires --team. Ignoring --project option.');
    }

    startSpinner('Fetching tickets...');

    try {
      const { tickets: rawTickets, context } = await (async (): Promise<{
        tickets: Ticket[];
        context: { team?: string; project?: string };
      }> => {
        if (resolved) {
          const response = await api.v1TeamsProjectsTicketsList(resolved.team, resolved.project);
          return {
            tickets: response.data,
            context: { team: resolved.team, project: resolved.project },
          };
        }
        if (options.team && options.project) {
          const response = await api.v1TeamsProjectsTicketsList(options.team, options.project);
          return {
            tickets: response.data,
            context: { team: options.team, project: options.project },
          };
        }
        if (options.team) {
          const response = await api.v1TeamsTicketsList(options.team);
          return {
            tickets: response.data,
            context: { team: options.team },
          };
        }
        const response = await api.v1TicketsList();
        return { tickets: response.data, context: {} };
      })();

      const tickets = rawTickets
        .filter((t) => !options.state || t.state === (options.state as TicketState))
        .filter((t) => !options.listType || t.listType === (options.listType as TicketListType));

      succeedSpinner(`Found ${tickets.length} ticket(s)`);

      if (options.table) {
        const columns = options.columns
          ? options.columns.split(',').map((c: string) => c.trim())
          : DEFAULT_COLUMNS;
        printTable(tickets, columns);
      } else {
        printJson({
          ...context,
          count: tickets.length,
          tickets,
        });
      }
    } catch (err) {
      failSpinner('Failed to fetch tickets');
      console.error(formatError(err));
      process.exit(1);
    }
  });
