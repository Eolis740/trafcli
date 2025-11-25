import { Command } from 'commander';
import fs from 'fs';
import { analyzeErrors } from '../../core/errorsCalc';
import { loadLogFile } from '../../core/loader';
import { renderTable } from '../../utils/table';
import { formatNumber } from '../../utils/format';
import { logError, logInfo } from '../../utils/logger';
import { formatWith } from '../../i18n';
import { CLIContext } from '../index';

export const registerErrorsCommand = (program: Command, ctx: CLIContext): void => {
  program
    .command('errors')
    .description(ctx.messages.errors.title)
    .option('-f, --file <path>', ctx.messages.common.fileOption)
    .option('-s, --status <code>', ctx.messages.common.statusOption, (v) => Number(v))
    .option('-p, --path <path>', ctx.messages.common.pathOption)
    .option('--service <name>', ctx.messages.common.serviceOption)
    .option('-n, --limit <number>', ctx.messages.common.limitOption, (v) => Number(v), 5)
    .action(async (options) => {
      const filePath = options.file || ctx.config.defaultFile;
      if (!filePath) {
        logError(ctx.messages.common.missingFile);
        return;
      }

      if (!fs.existsSync(filePath)) {
        logError(formatWith(ctx.messages.common.fileNotFound, { file: filePath }));
        return;
      }

      const logs = await loadLogFile(filePath);
      if (logs.length === 0) {
        logError(ctx.messages.common.noData);
        return;
      }

      logInfo(formatWith(ctx.messages.common.usingFile, { file: filePath }));

      const analysis = analyzeErrors(logs, {
        status: options.status,
        path: options.path,
        service: options.service
      }, options.limit);

      if (analysis.recent.length === 0) {
        logInfo(ctx.messages.errors.noErrors);
        return;
      }

      const countTable = renderTable(
        [
          { name: ctx.messages.errors.colStatus },
          { name: ctx.messages.stats.colCount, alignment: 'right' }
        ],
        Object.entries(analysis.counts)
          .sort((a, b) => Number(b[0]) - Number(a[0]))
          .map(([status, count]) => [status, formatNumber(count)])
      );

      const sampleTable = renderTable(
        [
          { name: ctx.messages.errors.colStatus },
          { name: ctx.messages.errors.colPath },
          { name: ctx.messages.errors.colService },
          { name: ctx.messages.errors.colTime },
          { name: ctx.messages.errors.colLatency, alignment: 'right' }
        ],
        analysis.recent.map((log) => [
          String(log.status),
          log.path,
          log.service ?? '-',
          log.timestamp,
          log.latencyMs
        ])
      );

      console.log('\n' + ctx.messages.errors.errorCounts);
      console.log(countTable);
      console.log('\n' + ctx.messages.errors.recentSamples);
      console.log(sampleTable);
    });
};
