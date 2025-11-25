"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatWith = exports.getMessages = void 0;
const en_1 = __importDefault(require("./en"));
const getMessages = (_lang) => {
    // Force English only.
    return en_1.default;
};
exports.getMessages = getMessages;
const formatWith = (template, vars) => {
    return Object.entries(vars).reduce((acc, [key, value]) => acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)), template);
};
exports.formatWith = formatWith;
//# sourceMappingURL=index.js.map