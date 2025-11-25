"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterLogs = void 0;
const filterLogs = (logs, options = {}) => {
    return logs.filter((log) => {
        if (options.status && log.status !== options.status)
            return false;
        if (options.path && !log.path.includes(options.path))
            return false;
        if (options.service && log.service !== options.service)
            return false;
        return true;
    });
};
exports.filterLogs = filterLogs;
//# sourceMappingURL=filter.js.map