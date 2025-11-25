"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadLogFile = exports.loadLogFileSync = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const readline_1 = __importDefault(require("readline"));
const parser_1 = require("./parser");
const isJsonArrayFile = (filePath) => {
    // 파일의 첫 글자가 '[' 인지 아닌지 확인
    // JSON 배열 형식인지 줄 단위 형식인지 구분
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
const loadLogFileSync = (filePath) => {
    const resolved = path_1.default.resolve(filePath);
    if (!fs_1.default.existsSync(resolved)) {
        return [];
    }
    const content = fs_1.default.readFileSync(resolved, 'utf-8');
    return (0, parser_1.parseLogs)(content);
};
exports.loadLogFileSync = loadLogFileSync;
const loadLogFile = async (filePath) => {
    const resolved = path_1.default.resolve(filePath);
    if (!fs_1.default.existsSync(resolved))
        return [];
    if (isJsonArrayFile(resolved)) {
        return (0, exports.loadLogFileSync)(resolved);
    }
    const entries = [];
    const stream = fs_1.default.createReadStream(resolved, { encoding: 'utf-8' });
    const rl = readline_1.default.createInterface({ input: stream, crlfDelay: Infinity });
    for await (const line of rl) {
        const entry = (0, parser_1.parseLogLine)(line);
        if (entry)
            entries.push(entry);
    }
    return entries;
};
exports.loadLogFile = loadLogFile;
//# sourceMappingURL=loader.js.map