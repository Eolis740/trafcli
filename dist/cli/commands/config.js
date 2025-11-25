"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerConfigCommand = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const file_1 = require("../../config/file");
const logger_1 = require("../../utils/logger");
const i18n_1 = require("../../i18n");
const registerConfigCommand = (program, ctx) => {
    program
        .command('config')
        .description(ctx.messages.config.title)
        .option('--set-file <path>', ctx.messages.common.fileOption)
        .option('--reset', ctx.messages.config.reset)
        .option('--show', ctx.messages.config.showing)
        .action(async (options) => {
        if (options.reset) {
            (0, file_1.resetConfig)();
            (0, logger_1.logInfo)(ctx.messages.common.configReset);
            return;
        }
        if (options.setFile) {
            const next = (0, file_1.setDefaultFile)(options.setFile);
            (0, logger_1.logInfo)((0, i18n_1.formatWith)(ctx.messages.common.configSaved, { file: next.defaultFile ?? '' }));
            return;
        }
        if (options.show) {
            const current = (0, file_1.readConfig)();
            (0, logger_1.logInfo)(ctx.messages.config.showing);
            console.log(JSON.stringify(current, null, 2));
            return;
        }
        const current = (0, file_1.readConfig)();
        const answers = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'defaultFile',
                message: ctx.messages.common.promptFile,
                default: current.defaultFile ?? ''
            }
        ]);
        const nextConfig = {
            ...current,
            ...answers,
            lang: 'en'
        };
        (0, file_1.writeConfig)(nextConfig);
        (0, logger_1.logInfo)(ctx.messages.common.configSaved);
    });
};
exports.registerConfigCommand = registerConfigCommand;
//# sourceMappingURL=config.js.map