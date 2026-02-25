import { Command } from 'commander';
import { getAllProjects, getProjectsByTeamKey, getRecentProjects } from '../../api/projects.js';
import { printTable, printJson, truncate, type TableColumn } from '../../utils/output.js';
import { startSpinner, succeedSpinner, failSpinner } from '../../utils/spinner.js';
import { formatError } from '../../utils/errors.js';

export const projectsCommand = new Command('projects')
  .description('List projects')
  .option('-t, --team <key>', 'Filter by team key')
  .option('-r, --recent', 'Show recently accessed projects')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    startSpinner('Fetching projects...');

    try {
      const projects = await (options.recent
        ? getRecentProjects()
        : options.team
          ? getProjectsByTeamKey(options.team)
          : getAllProjects());

      succeedSpinner(`Found ${projects.length} project(s)`);

      if (options.json) {
        printJson(projects);
        return;
      }

      if (projects.length === 0) {
        console.log('No projects found.');
        return;
      }

      const columns: TableColumn[] = [
        { header: 'Team', key: 'team_key', width: 25 },
        { header: 'Project', key: 'project_key', width: 25 },
        {
          header: 'Description',
          key: 'description',
          width: 35,
          formatter: (v) => truncate(String(v || ''), 32),
        },
        { header: 'Velocity', key: 'weekly_velocity', width: 10 },
      ];

      console.log();
      printTable(projects, columns);
    } catch (err) {
      failSpinner('Failed to fetch projects');
      console.error(formatError(err));
      process.exit(1);
    }
  });
