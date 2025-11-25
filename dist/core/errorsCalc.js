"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeErrors = void 0;
const filter_1 = require("./filter");
const time_1 = require("../utils/time");
const analyzeErrors = (logs, filters = {}, recent = 5) => {
    const errorLogs = logs.filter((log) => log.status >= 400);
    const filtered = (0, filter_1.filterLogs)(errorLogs, filters);
    const counts = {};
    filtered.forEach((log) => {
        counts[log.status] = (counts[log.status] ?? 0) + 1;
    });
    const recentSorted = (0, time_1.sortByTimeDesc)(filtered).slice(0, recent);
    return { counts, recent: recentSorted };
};
exports.analyzeErrors = analyzeErrors;
//# sourceMappingURL=errorsCalc.js.map