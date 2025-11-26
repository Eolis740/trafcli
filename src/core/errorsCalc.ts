import { FilterOptions, ErrorAnalysis, LogEntry } from './types';
import { filterLogs } from './filter';
import { sortByTimeDesc } from '../utils/time';

export const analyzeErrors = (
  logs: LogEntry[],
  filters: FilterOptions = {},
  recent = 5,
): ErrorAnalysis => {
  const errorLogs = logs.filter((log) => log.status >= 400);
  const filtered = filterLogs(errorLogs, filters);

  const counts: Record<number, number> = {};
  filtered.forEach((log) => {
    counts[log.status] = (counts[log.status] ?? 0) + 1;
  });

  const recentSorted = sortByTimeDesc(filtered).slice(0, recent);

  return { counts, recent: recentSorted };
};
