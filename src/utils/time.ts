import { LogEntry } from '../core/types';

export const toDate = (value: string): Date | null => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const secondKey = (date: Date): string => {
  const iso = date.toISOString();
  return iso.substring(0, 19) + 'Z';
};

export const sortByTimeDesc = (entries: LogEntry[]): LogEntry[] => {
  return [...entries].sort((a, b) => {
    const da = toDate(a.timestamp)?.getTime() ?? 0;
    const db = toDate(b.timestamp)?.getTime() ?? 0;
    return db - da;
  });
};
