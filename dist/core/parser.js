"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLogLine = exports.parseLogs = exports.normalizeEntry = void 0;
const requiredKeys = ['timestamp', 'path', 'status', 'latencyMs'];
const isValidEntry = (entry) => {
    if (!entry || typeof entry !== 'object')
        return false;
    return requiredKeys.every((key) => entry[key] !== undefined);
};
const normalizeEntry = (entry) => {
    if (!isValidEntry(entry))
        return null;
    const { timestamp, path, status, latencyMs, service, ...rest } = entry;
    const statusNumber = Number(status);
    const latencyNumber = Number(latencyMs);
    if (Number.isNaN(statusNumber) || Number.isNaN(latencyNumber))
        return null;
    return {
        timestamp: String(timestamp),
        path: String(path),
        status: statusNumber,
        latencyMs: latencyNumber,
        service: service ? String(service) : undefined,
        ...rest,
    };
};
exports.normalizeEntry = normalizeEntry;
const parseLogs = (content) => {
    const trimmed = content.trim();
    if (!trimmed)
        return [];
    let rawEntries = [];
    if (trimmed.startsWith('[')) {
        try {
            rawEntries = JSON.parse(trimmed);
        }
        catch (error) {
            return [];
        }
    }
    else {
        const lines = trimmed.split(/\r?\n/).filter((line) => line.trim().length > 0);
        rawEntries = lines.flatMap((line) => {
            try {
                return [JSON.parse(line)];
            }
            catch (error) {
                return [];
            }
        });
    }
    return rawEntries
        .map((entry) => {
        const normalized = (0, exports.normalizeEntry)(entry);
        return normalized;
    })
        .filter((entry) => Boolean(entry));
};
exports.parseLogs = parseLogs;
const parseLogLine = (line) => {
    const trimmed = line.trim();
    if (!trimmed)
        return null;
    try {
        const parsed = JSON.parse(trimmed);
        return (0, exports.normalizeEntry)(parsed);
    }
    catch {
        return null;
    }
};
exports.parseLogLine = parseLogLine;
//# sourceMappingURL=parser.js.map