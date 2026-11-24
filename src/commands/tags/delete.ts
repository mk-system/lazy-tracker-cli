import { Command } from 'commander';
import { api } from '../../api/client.js';
import { printJson, stripControlChars } from '../../utils/output.js';
import { startSpinner, succeedSpinner, failSpinner } from '../../utils/spinner.js';
import { formatError, CLIError } from '../../utils/errors.js';
import { confirm } from '../../utils/confirm.js';
import { resolveTeamProject } from '../../config/project.js';
import { encodePathSegment } from '../../utils/path.js';
import { matchTag } from './resolve.js';

export const deleteTagCommand = new Command('delete')
  .description('Delete a tag and remove it from every ticket in the project')
  .argument('<tag>', 'Tag name or ID')
  .option('-t, --team <key>', 'Team key')
  .option('-p, --project <key>', 'Project key')
  .option('-f, --force', 'Skip confirmation')
  .action(async (tagNameOrId, options) => {
    const resolved = resolveTeamProject({ team: options.team, project: options.project });
    if (!resolved) {
      console.error(
        'Team and project are required. Create .lazy-tracker.json or specify --team and --project options.'
      );
      process.exit(1);
    }

    startSpinner('Looking up tag...');

    try {
      const team = encodePathSegment(resolved.team);
      const project = encodePathSegment(resolved.project);
      const { data: tags } = await api.v1TeamsProjectsTagsList(team, project);
      const tag = matchTag(tags, tagNameOrId);
      succeedSpinner(`Found tag "${stripControlChars(tag.name)}"`);

      if (!options.force) {
        if (!process.stdin.isTTY) {
          throw new CLIError('Refusing to delete without --force in a non-interactive session.');
        }
        const confirmed = await confirm(
          `Are you sure you want to delete tag "${tag.name}"? It will be removed from every ticket in ${resolved.team}/${resolved.project}.`
        );
        if (!confirmed) {
          console.error('Cancelled.');
          process.exit(0);
        }
      }

      startSpinner('Deleting tag...');
      await api.v1TeamsProjectsTagsDelete(team, project, encodePathSegment(tag.id));
      succeedSpinner('Tag deleted');

      await printJson({
        team: resolved.team,
        project: resolved.project,
        deleted: true,
        tagId: tag.id,
        name: tag.name,
      });
    } catch (err) {
      failSpinner('Failed to delete tag');
      console.error(formatError(err));
      process.exit(1);
    }
  });
