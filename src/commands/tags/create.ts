import { Command } from 'commander';
import { api } from '../../api/client.js';
import { printJson } from '../../utils/output.js';
import { startSpinner, succeedSpinner, failSpinner } from '../../utils/spinner.js';
import { formatError } from '../../utils/errors.js';
import { resolveTeamProject } from '../../config/project.js';
import { normalizeTagName } from './resolve.js';

export const createTagCommand = new Command('create')
  .description('Create a tag, or return the existing tag with the same name (JSON output)')
  .option('-t, --team <key>', 'Team key')
  .option('-p, --project <key>', 'Project key')
  .requiredOption('--name <name>', 'Tag name')
  .action(async (options) => {
    const resolved = resolveTeamProject({ team: options.team, project: options.project });
    if (!resolved) {
      console.error(
        'Team and project are required. Create .lazy-tracker.json or specify --team and --project options.'
      );
      process.exit(1);
    }

    const team = encodeURIComponent(resolved.team);
    const project = encodeURIComponent(resolved.project);

    startSpinner('Creating tag...');

    try {
      const name = normalizeTagName(options.name);
      const response = await api.v1TeamsProjectsTagsCreate(team, project, {
        name,
      });
      succeedSpinner('Tag created');

      await printJson({
        team: resolved.team,
        project: resolved.project,
        tag: response.data,
      });
    } catch (err) {
      failSpinner('Failed to create tag');
      console.error(formatError(err));
      process.exit(1);
    }
  });
