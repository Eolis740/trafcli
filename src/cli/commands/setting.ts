import inquirer from 'inquirer';
import { Command } from 'commander';
import { readConfig, resetConfig, setDefaultFile, setLanguage } from '../../config/file';
import { Locale } from '../../core/types';
import { CLIContext } from '../index';
import { logInfo } from '../../utils/logger';
import { getMessages } from '../../i18n';

export const runSettingMenu = async (ctx: CLIContext): Promise<void> => {
  let exit = false;
  while (!exit) {
    console.clear();
    const current = readConfig();
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: ctx.messages.config.menuTitle,
        choices: [
          { name: ctx.messages.config.setFile, value: 'file' },
          { name: ctx.messages.config.showing, value: 'show' },
          { name: ctx.messages.config.reset, value: 'reset' },
          { name: ctx.messages.config.back, value: 'exit' }
        ]
      }
    ]);

    if (action === 'exit') {
      exit = true;
      break;
    }

    if (action === 'show') {
      console.log(JSON.stringify(current, null, 2));
      continue;
    }

    if (action === 'reset') {
      resetConfig();
      ctx.messages = getMessages(readConfig().lang);
      logInfo(ctx.messages.common.configReset);
      continue;
    }

    if (action === 'file') {
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'file',
          message: ctx.messages.common.promptFile,
          default: current.defaultFile ?? ''
        }
      ]);
      setDefaultFile(answer.file);
      logInfo(ctx.messages.common.configSaved);
    }
  }
};

export const registerSettingCommand = (program: Command, ctx: CLIContext): void => {
  program
    .command('setting')
    .description(ctx.messages.config.title)
    .action(async () => {
      await runSettingMenu(ctx);
    });
};
