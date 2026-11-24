import { Command } from 'commander';
import { api } from '../../api/client.js';
import { printJson } from '../../utils/output.js';
import { startSpinner, succeedSpinner, failSpinner } from '../../utils/spinner.js';
import { formatError } from '../../utils/errors.js';
import { resolveTeamProject } from '../../config/project.js';
import { assertTagNameAvailable, matchTag, normalizeTagName } from './resolve.js';

export const updateTagCommand = new Command('update')
  .description('Rename a tag (JSON output)')
  .argument('<tag>', 'Tag name or ID')
  .option('-t, --team <key>', 'Team key')
  .option('-p, --project <key>', 'Project key')
  .requiredOption('--name <name>', 'New tag name')
  .action(async (tagNameOrId, options) => {
    const resolved = resolveTeamProject({ team: options.team, project: options.project });
    if (!resolved) {
      console.error(
        'Team and project are required. Create .lazy-tracker.json or specify --team and --project options.'
      );
      process.exit(1);
    }

    const team = encodeURIComponent(resolved.team);
    const project = encodeURIComponent(resolved.project);

    startSpinner('Updating tag...');

    try {
      const name = normalizeTagName(options.name);
      const { data: tags } = await api.v1TeamsProjectsTagsList(team, project);
      const tag = matchTag(tags, tagNameOrId);
      // The server reports a duplicate name as a misleading 404, so reject it up front.
      assertTagNameAvailable(tags, name);

      const response = await api.v1TeamsProjectsTagsUpdate(
        team,
        project,
        encodeURIComponent(tag.id),
        { name }
      );
      succeedSpinner('Tag updated');

      await printJson({
        team: resolved.team,
        project: resolved.project,
        tag: response.data,
      });
    } catch (err) {
      failSpinner('Failed to update tag');
      console.error(formatError(err));
      process.exit(1);
    }
  });
