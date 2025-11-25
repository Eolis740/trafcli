"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = exports.logWarn = exports.logInfo = void 0;
const chalk_1 = __importDefault(require("chalk"));
const logInfo = (message) => {
    console.log(chalk_1.default.cyan(message));
};
exports.logInfo = logInfo;
const logWarn = (message) => {
    console.warn(chalk_1.default.yellow(message));
};
exports.logWarn = logWarn;
const logError = (message) => {
    console.error(chalk_1.default.red(message));
};
exports.logError = logError;
//# sourceMappingURL=logger.js.map