"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateSearchStream = exports.aggregateQpsStream = exports.aggregateErrorsStream = exports.aggregateStatsStream = void 0;
const fs_1 = __importDefault(require("fs"));
const readline_1 = __importDefault(require("readline"));
const path_1 = __importDefault(require("path"));
const errorsCalc_1 = require("./errorsCalc");
const qpsCalc_1 = require("./qpsCalc");
const statsCalc_1 = require("./statsCalc");
const parser_1 = require("./parser");
const loader_1 = require("./loader");
const isJsonArrayFile = (filePath) => {
    try {
        const fd = fs_1.default.openSync(filePath, 'r');
        const buffer = Buffer.alloc(1);
        fs_1.default.readSync(fd, buffer, 0, 1, 0);
        fs_1.default.closeSync(fd);
        return buffer.toString() === '[';
    }
    catch {
        return false;
    }
};
const statSize = (filePath) => {
    try {
        return fs_1.default.statSync(filePath).size;
    }
    catch {
        return 0;
    }
};
const streamNdjson = async function* (filePath, start = 0) {
    const stream = fs_1.default.createReadStream(filePath, { encoding: 'utf-8', start });
    const rl = readline_1.default.createInterface({ input: stream, crlfDelay: Infinity });
    for await (const line of rl) {
        const entry = (0, parser_1.parseLogLine)(line);
        if (entry)
            yield entry;
    }
};
const readEntries = async (filePath, offset) => {
    const resolved = path_1.default.resolve(filePath);
    if (!fs_1.default.existsSync(resolved))
        return { entries: [], offset: 0 };
    if (isJsonArrayFile(resolved)) {
        const all = (0, loader_1.loadLogFileSync)(resolved);
        return { entries: all, offset: statSize(resolved) };
    }
    const start = offset ?? 0;
    const nextOffset = statSize(resolved);
    return { entries: streamNdjson(resolved, start), offset: nextOffset };
};
const aggregateStatsStream = async (filePath, offset) => {
    const { entries, offset: nextOffset } = await readEntries(filePath, offset);
    const list = [];
    if (Symbol.asyncIterator in Object(entries)) {
        for await (const e of entries) {
            list.push(e);
        }
    }
    else {
        list.push(...entries);
    }
    if (list.length === 0)
        return { result: null, offset: nextOffset };
    return { result: (0, statsCalc_1.calculateStats)(list), offset: nextOffset };
};
exports.aggregateStatsStream = aggregateStatsStream;
const aggregateErrorsStream = async (filePath, filters, recent, offset) => {
    const { entries, offset: nextOffset } = await readEntries(filePath, offset);
    const list = [];
    if (Symbol.asyncIterator in Object(entries)) {
        for await (const e of entries) {
            list.push(e);
        }
    }
    else {
        list.push(...entries);
    }
    if (list.length === 0)
        return { result: null, offset: nextOffset };
    return { result: (0, errorsCalc_1.analyzeErrors)(list, filters, recent), offset: nextOffset };
};
exports.aggregateErrorsStream = aggregateErrorsStream;
const aggregateQpsStream = async (filePath, groupBy, offset) => {
    const { entries, offset: nextOffset } = await readEntries(filePath, offset);
    const list = [];
    if (Symbol.asyncIterator in Object(entries)) {
        for await (const e of entries) {
            list.push(e);
        }
    }
    else {
        list.push(...entries);
    }
    if (list.length === 0)
        return { result: null, offset: nextOffset };
    return { result: (0, qpsCalc_1.calculateQps)(list, groupBy), offset: nextOffset };
};
exports.aggregateQpsStream = aggregateQpsStream;
const aggregateSearchStream = async (filePath, keyword, filters, limit, offset) => {
    const { entries, offset: nextOffset } = await readEntries(filePath, offset);
    const list = [];
    const kw = keyword.toLowerCase();
    const max = Number.isFinite(limit) ? limit : 20;
    if (Symbol.asyncIterator in Object(entries)) {
        for await (const e of entries) {
            if (list.length >= max)
                break;
            if (filters.status && e.status !== filters.status)
                continue;
            if (filters.path && !e.path.includes(filters.path))
                continue;
            if (filters.service && e.service !== filters.service)
                continue;
            if (!JSON.stringify(e).toLowerCase().includes(kw))
                continue;
            list.push(e);
        }
    }
    else {
        for (const e of entries) {
            if (list.length >= max)
                break;
            if (filters.status && e.status !== filters.status)
                continue;
            if (filters.path && !e.path.includes(filters.path))
                continue;
            if (filters.service && e.service !== filters.service)
                continue;
            if (!JSON.stringify(e).toLowerCase().includes(kw))
                continue;
            list.push(e);
        }
    }
    if (list.length === 0)
        return { result: null, offset: nextOffset };
    return { result: list, offset: nextOffset };
};
exports.aggregateSearchStream = aggregateSearchStream;
//# sourceMappingURL=streaming.js.map