import { LogEntry, QpsResult, QpsPoint } from './types';
import { toDate, secondKey } from '../utils/time';

export const calculateQps = (logs: LogEntry[], groupBy?: 'service' | 'path'): QpsResult => {
  if (logs.length === 0) return { averageQps: 0, peakQps: 0, series: [] };

  const buckets = new Map<string, number>();
  let minTime = Number.POSITIVE_INFINITY;
  let maxTime = 0;

  logs.forEach((log) => {
    const date = toDate(log.timestamp);
    if (!date) return;
    const ts = date.getTime();
    minTime = Math.min(minTime, ts);
    maxTime = Math.max(maxTime, ts);
    const baseKey = secondKey(date);
    const groupKey = groupBy ? String(log[groupBy] ?? 'unknown') : '';
    const key = groupKey ? `${baseKey}|${groupKey}` : baseKey;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  });

  const durationSeconds = Math.max(1, Math.round((maxTime - minTime) / 1000) + 1);
  const total = Array.from(buckets.values()).reduce((a, b) => a + b, 0);
  const averageQps = total / durationSeconds;
  const peakQps = buckets.size ? Math.max(...buckets.values()) : 0;

  const series: QpsPoint[] = Array.from(buckets.entries()).map(([key, count]) => {
    const [time, group] = key.split('|');
    return { time, group: group || undefined, count };
  });

  series.sort((a, b) => a.time.localeCompare(b.time));

  return { averageQps, peakQps, series };
};
