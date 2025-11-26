import { LogEntry, StatsResult } from './types';

const percentile = (values: number[], p: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil(p * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, idx))];
};

export const calculateStats = (logs: LogEntry[], topLimit = 5): StatsResult => {
  const totalRequests = logs.length;
  const statusGroups: Record<string, number> = { '2xx': 0, '4xx': 0, '5xx': 0, other: 0 };
  const latencies: number[] = [];
  const endpointCounts: Record<string, number> = {};

  logs.forEach((log) => {
    if (log.status >= 200 && log.status < 300) statusGroups['2xx'] += 1;
    else if (log.status >= 400 && log.status < 500) statusGroups['4xx'] += 1;
    else if (log.status >= 500 && log.status < 600) statusGroups['5xx'] += 1;
    else statusGroups.other += 1;

    latencies.push(log.latencyMs);
    endpointCounts[log.path] = (endpointCounts[log.path] ?? 0) + 1;
  });

  const latency = {
    avg: latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
    max: latencies.length ? Math.max(...latencies) : 0,
    p95: percentile(latencies, 0.95),
    p99: percentile(latencies, 0.99),
  };

  const endpointEntries = Object.entries(endpointCounts).sort((a, b) => b[1] - a[1]);
  const limit = topLimit && topLimit > 0 ? topLimit : endpointEntries.length;
  const topEndpoints = endpointEntries.slice(0, limit).map(([path, count]) => ({ path, count }));

  return { totalRequests, statusGroups, latency, topEndpoints };
};
