import { FilterOptions, LogEntry } from './types';

export const filterLogs = (logs: LogEntry[], options: FilterOptions = {}): LogEntry[] => {
  return logs.filter((log) => {
    if (options.status && log.status !== options.status) return false;
    if (options.path && !log.path.includes(options.path)) return false;
    if (options.service && log.service !== options.service) return false;
    return true;
  });
};
