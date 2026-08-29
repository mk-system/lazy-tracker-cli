import { Command } from 'commander';
import { getSkillsContent } from './content.js';
import { installCommand } from './install.js';
import { uninstallCommand } from './uninstall.js';

export const skillsCommand = new Command('skills')
  .description('Manage CLI skills for coding agents')
  .action(() => {
    console.log(getSkillsContent());
  })
  .addCommand(installCommand)
  .addCommand(uninstallCommand);
