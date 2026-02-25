import { Command } from 'commander';
import { api } from '../../api/client.js';
import { printTable, printJson, truncate, type TableColumn } from '../../utils/output.js';
import { startSpinner, succeedSpinner, failSpinner } from '../../utils/spinner.js';
import { formatError } from '../../utils/errors.js';

export const teamsCommand = new Command('teams')
  .description('List teams')
  .option('-a, --all', 'Show all teams (not just your teams)')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    startSpinner('Fetching teams...');

    try {
      const response = options.all ? await api.v1TeamsList() : await api.v1TeamsMyList();
      const teams = response.data;
      succeedSpinner(`Found ${teams.length} team(s)`);

      if (options.json) {
        printJson(teams);
        return;
      }

      if (teams.length === 0) {
        console.log('No teams found.');
        return;
      }

      const columns: TableColumn[] = [
        { header: 'Key', key: 'team_key', width: 30 },
        {
          header: 'Description',
          key: 'description',
          width: 50,
          formatter: (v) => truncate(String(v || ''), 47),
        },
      ];

      console.log();
      printTable(teams, columns);
    } catch (err) {
      failSpinner('Failed to fetch teams');
      console.error(formatError(err));
      process.exit(1);
    }
  });
