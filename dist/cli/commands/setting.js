"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSettingCommand = exports.runSettingMenu = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const file_1 = require("../../config/file");
const logger_1 = require("../../utils/logger");
const i18n_1 = require("../../i18n");
const runSettingMenu = async (ctx) => {
    let exit = false;
    while (!exit) {
        console.clear();
        const current = (0, file_1.readConfig)();
        const { action } = await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'action',
                message: ctx.messages.config.menuTitle,
                choices: [
                    { name: ctx.messages.config.setFile, value: 'file' },
                    { name: ctx.messages.config.showing, value: 'show' },
                    { name: ctx.messages.config.reset, value: 'reset' },
                    { name: ctx.messages.config.back, value: 'exit' },
                ],
            },
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
            (0, file_1.resetConfig)();
            ctx.messages = (0, i18n_1.getMessages)();
            (0, logger_1.logInfo)(ctx.messages.common.configReset);
            continue;
        }
        if (action === 'file') {
            const answer = await inquirer_1.default.prompt([
                {
                    type: 'input',
                    name: 'file',
                    message: ctx.messages.common.promptFile,
                    default: current.defaultFile ?? '',
                },
            ]);
            (0, file_1.setDefaultFile)(answer.file);
            (0, logger_1.logInfo)(ctx.messages.common.configSaved);
        }
    }
};
exports.runSettingMenu = runSettingMenu;
const registerSettingCommand = (program, ctx) => {
    program
        .command('setting')
        .description(ctx.messages.config.title)
        .action(async () => {
        await (0, exports.runSettingMenu)(ctx);
    });
};
exports.registerSettingCommand = registerSettingCommand;
//# sourceMappingURL=setting.js.map