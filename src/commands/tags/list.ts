import { Command } from 'commander';
import { api } from '../../api/client.js';
import { printJson, printTable } from '../../utils/output.js';
import { startSpinner, succeedSpinner, failSpinner } from '../../utils/spinner.js';
import { formatError } from '../../utils/errors.js';
import { resolveTeamProject } from '../../config/project.js';
import { encodePathSegment } from '../../utils/path.js';

export const listTagsCommand = new Command('list')
  .description('List tags in a project (JSON output by default)')
  .option('-t, --team <key>', 'Team key')
  .option('-p, --project <key>', 'Project key')
  .option('--table', 'Display as table instead of JSON')
  .action(async (options) => {
    const resolved = resolveTeamProject({ team: options.team, project: options.project });
    if (!resolved) {
      console.error(
        'Team and project are required. Create .lazy-tracker.json or specify --team and --project options.'
      );
      process.exit(1);
    }

    startSpinner('Fetching tags...');

    try {
      const team = encodePathSegment(resolved.team);
      const project = encodePathSegment(resolved.project);
      const { data: tags } = await api.v1TeamsProjectsTagsList(team, project);
      succeedSpinner(`Found ${tags.length} tag(s)`);

      if (options.table) {
        if (tags.length === 0) {
          console.log('No tags found.');
          return;
        }
        printTable(tags, [
          { header: 'Name', key: 'name' },
          { header: 'ID', key: 'id' },
        ]);
      } else {
        await printJson({
          team: resolved.team,
          project: resolved.project,
          count: tags.length,
          tags,
        });
      }
    } catch (err) {
      failSpinner('Failed to fetch tags');
      console.error(formatError(err));
      process.exit(1);
    }
  });
