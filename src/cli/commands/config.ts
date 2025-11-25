import { Command } from 'commander';
import inquirer from 'inquirer';
import { readConfig, resetConfig, setDefaultFile, writeConfig } from '../../config/file';
import { logInfo } from '../../utils/logger';
import { formatWith } from '../../i18n';
import { CLIContext } from '../index';
import { Locale } from '../../core/types';

export const registerConfigCommand = (program: Command, ctx: CLIContext): void => {
  program
    .command('config')
    .description(ctx.messages.config.title)
    .option('--set-file <path>', ctx.messages.common.fileOption)
    .option('--reset', ctx.messages.config.reset)
    .option('--show', ctx.messages.config.showing)
    .action(async (options) => {
      if (options.reset) {
        resetConfig();
        logInfo(ctx.messages.common.configReset);
        return;
      }

      if (options.setFile) {
        const next = setDefaultFile(options.setFile);
        logInfo(formatWith(ctx.messages.common.configSaved, { file: next.defaultFile ?? '' }));
        return;
      }

      if (options.show) {
        const current = readConfig();
        logInfo(ctx.messages.config.showing);
        console.log(JSON.stringify(current, null, 2));
        return;
      }

      const current = readConfig();
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'defaultFile',
          message: ctx.messages.common.promptFile,
          default: current.defaultFile ?? ''
        }
      ]);

      const nextConfig: typeof current & typeof answers = {
        ...current,
        ...answers,
        lang: 'en' as Locale
      };
      writeConfig(nextConfig);
      logInfo(ctx.messages.common.configSaved);
    });
};
