import { Command } from 'commander';
import fs from 'fs';
import { calculateStats } from '../../core/statsCalc';
import { loadLogFile } from '../../core/loader';
import { renderTable } from '../../utils/table';
import { formatNumber, formatPercent, formatMs } from '../../utils/format';
import { logError, logInfo } from '../../utils/logger';
import { formatWith } from '../../i18n';
import { CLIContext } from '../index';

export const registerStatsCommand = (program: Command, ctx: CLIContext): void => {
  program
    .command('stats')
    .description(ctx.messages.stats.title)
    .option('-f, --file <path>', ctx.messages.common.fileOption)
    .option('--watch', ctx.messages.common.watchOption)
    .option('-i, --interval <seconds>', ctx.messages.common.intervalOption, (v) => Number(v), 2)
    .option('-t, --top <number>', 'Top endpoints to display (0 = all)', (v) => Number(v), 5)
    .option('--all', 'Show all endpoints')
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

      const render = async () => {
        const logs = await loadLogFile(filePath);
        if (logs.length === 0) {
          logError(ctx.messages.common.noData);
          return false;
        }

        const topLimit = options.all ? 0 : (options.top ?? 5);
        const stats = calculateStats(logs, topLimit);

        const statusTable = renderTable(
          [
            { name: ctx.messages.stats.colStatus },
            { name: ctx.messages.stats.colCount, alignment: 'right' },
            { name: '%' },
          ],
          Object.entries(stats.statusGroups).map(([key, count]) => [
            ctx.messages.stats.statuses[key] ?? key,
            formatNumber(count),
            stats.totalRequests ? formatPercent(count / stats.totalRequests) : '0%',
          ]),
        );

        const latencyTable = renderTable(
          [
            { name: ctx.messages.stats.average },
            { name: ctx.messages.stats.max },
            { name: ctx.messages.stats.p95 },
            { name: ctx.messages.stats.p99 },
          ],
          [
            [
              formatMs(stats.latency.avg),
              formatMs(stats.latency.max),
              formatMs(stats.latency.p95),
              formatMs(stats.latency.p99),
            ],
          ],
        );

        const endpointTable = renderTable(
          [
            { name: ctx.messages.stats.colPath },
            { name: ctx.messages.stats.colCount, alignment: 'right' },
          ],
          stats.topEndpoints.map((item) => [item.path, formatNumber(item.count)]),
        );

        console.clear();
        logInfo(formatWith(ctx.messages.common.usingFile, { file: filePath }));
        console.log('\n' + ctx.messages.stats.title);
        console.log(`${ctx.messages.stats.totalRequests}: ${formatNumber(stats.totalRequests)}`);
        console.log('\n' + ctx.messages.stats.statusBreakdown);
        console.log(statusTable);
        console.log('\n' + ctx.messages.stats.latencySummary);
        console.log(latencyTable);
        console.log('\n' + ctx.messages.stats.topEndpoints);
        console.log(endpointTable);
        return true;
      };

      const ok = await render();
      if (!ok) return;

      if (options.watch) {
        logInfo(ctx.messages.common.watchStart);
        const intervalMs = Math.max(1, options.interval || 2) * 1000;
        setInterval(() => {
          void render();
        }, intervalMs);
      }
    });
};
