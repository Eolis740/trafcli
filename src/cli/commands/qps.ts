import fs from 'fs';
import { Command } from 'commander';
import { loadLogFile } from '../../core/loader';
import { calculateQps } from '../../core/qpsCalc';
import { renderTable } from '../../utils/table';
import { formatNumber, formatMs } from '../../utils/format';
import { logError, logInfo } from '../../utils/logger';
import { formatWith } from '../../i18n';
import { CLIContext } from '../index';

export const registerQpsCommand = (program: Command, ctx: CLIContext): void => {
  program
    .command('qps')
    .description(ctx.messages.qps.title)
    .option('-f, --file <path>', ctx.messages.common.fileOption)
    .option(
      '-g, --group-by <field>',
      ctx.messages.common.groupOption,
      (v) => v as 'service' | 'path',
    )
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

      const result = calculateQps(logs, options.groupBy);

      const seriesTable = renderTable(
        [
          { name: ctx.messages.qps.colTime },
          { name: ctx.messages.qps.colGroup },
          { name: ctx.messages.qps.colCount, alignment: 'right' },
        ],
        result.series.map((item) => [item.time, item.group ?? '-', formatNumber(item.count)]),
      );

      console.log('\n' + ctx.messages.qps.title);
      console.log(`${ctx.messages.qps.averageQps}: ${formatMs(result.averageQps)}`);
      console.log(`${ctx.messages.qps.peakQps}: ${formatMs(result.peakQps)}`);
      console.log(seriesTable);
    });
};
