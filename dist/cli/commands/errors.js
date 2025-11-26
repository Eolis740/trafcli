"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerErrorsCommand = void 0;
const fs_1 = __importDefault(require("fs"));
const errorsCalc_1 = require("../../core/errorsCalc");
const loader_1 = require("../../core/loader");
const table_1 = require("../../utils/table");
const format_1 = require("../../utils/format");
const logger_1 = require("../../utils/logger");
const i18n_1 = require("../../i18n");
const registerErrorsCommand = (program, ctx) => {
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
            (0, logger_1.logError)(ctx.messages.common.missingFile);
            return;
        }
        if (!fs_1.default.existsSync(filePath)) {
            (0, logger_1.logError)((0, i18n_1.formatWith)(ctx.messages.common.fileNotFound, { file: filePath }));
            return;
        }
        const logs = await (0, loader_1.loadLogFile)(filePath);
        if (logs.length === 0) {
            (0, logger_1.logError)(ctx.messages.common.noData);
            return;
        }
        (0, logger_1.logInfo)((0, i18n_1.formatWith)(ctx.messages.common.usingFile, { file: filePath }));
        const analysis = (0, errorsCalc_1.analyzeErrors)(logs, {
            status: options.status,
            path: options.path,
            service: options.service,
        }, options.limit);
        if (analysis.recent.length === 0) {
            (0, logger_1.logInfo)(ctx.messages.errors.noErrors);
            return;
        }
        const countTable = (0, table_1.renderTable)([
            { name: ctx.messages.errors.colStatus },
            { name: ctx.messages.stats.colCount, alignment: 'right' },
        ], Object.entries(analysis.counts)
            .sort((a, b) => Number(b[0]) - Number(a[0]))
            .map(([status, count]) => [status, (0, format_1.formatNumber)(count)]));
        const sampleTable = (0, table_1.renderTable)([
            { name: ctx.messages.errors.colStatus },
            { name: ctx.messages.errors.colPath },
            { name: ctx.messages.errors.colService },
            { name: ctx.messages.errors.colTime },
            { name: ctx.messages.errors.colLatency, alignment: 'right' },
        ], analysis.recent.map((log) => [
            String(log.status),
            log.path,
            log.service ?? '-',
            log.timestamp,
            log.latencyMs,
        ]));
        console.log('\n' + ctx.messages.errors.errorCounts);
        console.log(countTable);
        console.log('\n' + ctx.messages.errors.recentSamples);
        console.log(sampleTable);
    });
};
exports.registerErrorsCommand = registerErrorsCommand;
//# sourceMappingURL=errors.js.map