"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerStatsCommand = void 0;
const fs_1 = __importDefault(require("fs"));
const statsCalc_1 = require("../../core/statsCalc");
const loader_1 = require("../../core/loader");
const table_1 = require("../../utils/table");
const format_1 = require("../../utils/format");
const logger_1 = require("../../utils/logger");
const i18n_1 = require("../../i18n");
const registerStatsCommand = (program, ctx) => {
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
            (0, logger_1.logError)(ctx.messages.common.missingFile);
            return;
        }
        if (!fs_1.default.existsSync(filePath)) {
            (0, logger_1.logError)((0, i18n_1.formatWith)(ctx.messages.common.fileNotFound, { file: filePath }));
            return;
        }
        const render = async () => {
            const logs = await (0, loader_1.loadLogFile)(filePath);
            if (logs.length === 0) {
                (0, logger_1.logError)(ctx.messages.common.noData);
                return false;
            }
            const topLimit = options.all ? 0 : options.top ?? 5;
            const stats = (0, statsCalc_1.calculateStats)(logs, topLimit);
            const statusTable = (0, table_1.renderTable)([
                { name: ctx.messages.stats.colStatus },
                { name: ctx.messages.stats.colCount, alignment: 'right' },
                { name: '%' }
            ], Object.entries(stats.statusGroups).map(([key, count]) => [
                ctx.messages.stats.statuses[key] ?? key,
                (0, format_1.formatNumber)(count),
                stats.totalRequests ? (0, format_1.formatPercent)(count / stats.totalRequests) : '0%'
            ]));
            const latencyTable = (0, table_1.renderTable)([
                { name: ctx.messages.stats.average },
                { name: ctx.messages.stats.max },
                { name: ctx.messages.stats.p95 },
                { name: ctx.messages.stats.p99 }
            ], [[
                    (0, format_1.formatMs)(stats.latency.avg),
                    (0, format_1.formatMs)(stats.latency.max),
                    (0, format_1.formatMs)(stats.latency.p95),
                    (0, format_1.formatMs)(stats.latency.p99)
                ]]);
            const endpointTable = (0, table_1.renderTable)([
                { name: ctx.messages.stats.colPath },
                { name: ctx.messages.stats.colCount, alignment: 'right' }
            ], stats.topEndpoints.map((item) => [item.path, (0, format_1.formatNumber)(item.count)]));
            console.clear();
            (0, logger_1.logInfo)((0, i18n_1.formatWith)(ctx.messages.common.usingFile, { file: filePath }));
            console.log('\n' + ctx.messages.stats.title);
            console.log(`${ctx.messages.stats.totalRequests}: ${(0, format_1.formatNumber)(stats.totalRequests)}`);
            console.log('\n' + ctx.messages.stats.statusBreakdown);
            console.log(statusTable);
            console.log('\n' + ctx.messages.stats.latencySummary);
            console.log(latencyTable);
            console.log('\n' + ctx.messages.stats.topEndpoints);
            console.log(endpointTable);
            return true;
        };
        const ok = await render();
        if (!ok)
            return;
        if (options.watch) {
            (0, logger_1.logInfo)(ctx.messages.common.watchStart);
            const intervalMs = Math.max(1, options.interval || 2) * 1000;
            setInterval(() => {
                void render();
            }, intervalMs);
        }
    });
};
exports.registerStatsCommand = registerStatsCommand;
//# sourceMappingURL=stats.js.map