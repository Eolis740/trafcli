"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateQps = void 0;
const time_1 = require("../utils/time");
const calculateQps = (logs, groupBy) => {
    if (logs.length === 0)
        return { averageQps: 0, peakQps: 0, series: [] };
    const buckets = new Map();
    let minTime = Number.POSITIVE_INFINITY;
    let maxTime = 0;
    logs.forEach((log) => {
        const date = (0, time_1.toDate)(log.timestamp);
        if (!date)
            return;
        const ts = date.getTime();
        minTime = Math.min(minTime, ts);
        maxTime = Math.max(maxTime, ts);
        const baseKey = (0, time_1.secondKey)(date);
        const groupKey = groupBy ? String(log[groupBy] ?? 'unknown') : '';
        const key = groupKey ? `${baseKey}|${groupKey}` : baseKey;
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
    });
    const durationSeconds = Math.max(1, Math.round((maxTime - minTime) / 1000) + 1);
    const total = Array.from(buckets.values()).reduce((a, b) => a + b, 0);
    const averageQps = total / durationSeconds;
    const peakQps = buckets.size ? Math.max(...buckets.values()) : 0;
    const series = Array.from(buckets.entries()).map(([key, count]) => {
        const [time, group] = key.split('|');
        return { time, group: group || undefined, count };
    });
    series.sort((a, b) => a.time.localeCompare(b.time));
    return { averageQps, peakQps, series };
};
exports.calculateQps = calculateQps;
//# sourceMappingURL=qpsCalc.js.map