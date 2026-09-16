import { Command } from 'commander';
import { api } from '../../api/client.js';
import { printTable, printJson, type TableColumn } from '../../utils/output.js';
import { startSpinner, succeedSpinner, failSpinner } from '../../utils/spinner.js';
import { formatError } from '../../utils/errors.js';

export const teamsMembersCommand = new Command('members')
  .description('List members of a team')
  .argument('<teamKey>', 'Team key')
  .option('--json', 'Output as JSON')
  .action(async (teamKey: string, options) => {
    startSpinner('Fetching members...');

    try {
      const response = await api.v1TeamsMembersList(teamKey);
      const members = response.data;
      succeedSpinner(`Found ${members.length} member(s)`);

      if (options.json) {
        await printJson(members);
        return;
      }

      if (members.length === 0) {
        console.log('No members found.');
        return;
      }

      const columns: TableColumn[] = [
        { header: 'Display Name', key: 'displayName', width: 30 },
        { header: 'User ID', key: 'userId', width: 38 },
        { header: 'Role', key: 'role', width: 12 },
        { header: 'Email', key: 'email', width: 30 },
      ];

      console.log();
      printTable(members, columns);
    } catch (err) {
      failSpinner('Failed to fetch members');
      console.error(formatError(err));
      process.exit(1);
    }
  });
