"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerQpsCommand = void 0;
const fs_1 = __importDefault(require("fs"));
const loader_1 = require("../../core/loader");
const qpsCalc_1 = require("../../core/qpsCalc");
const table_1 = require("../../utils/table");
const format_1 = require("../../utils/format");
const logger_1 = require("../../utils/logger");
const i18n_1 = require("../../i18n");
const registerQpsCommand = (program, ctx) => {
    program
        .command('qps')
        .description(ctx.messages.qps.title)
        .option('-f, --file <path>', ctx.messages.common.fileOption)
        .option('-g, --group-by <field>', ctx.messages.common.groupOption, (v) => v)
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
        const result = (0, qpsCalc_1.calculateQps)(logs, options.groupBy);
        const seriesTable = (0, table_1.renderTable)([
            { name: ctx.messages.qps.colTime },
            { name: ctx.messages.qps.colGroup },
            { name: ctx.messages.qps.colCount, alignment: 'right' },
        ], result.series.map((item) => [item.time, item.group ?? '-', (0, format_1.formatNumber)(item.count)]));
        console.log('\n' + ctx.messages.qps.title);
        console.log(`${ctx.messages.qps.averageQps}: ${(0, format_1.formatMs)(result.averageQps)}`);
        console.log(`${ctx.messages.qps.peakQps}: ${(0, format_1.formatMs)(result.peakQps)}`);
        console.log(seriesTable);
    });
};
exports.registerQpsCommand = registerQpsCommand;
//# sourceMappingURL=qps.js.map