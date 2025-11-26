import { LogEntry } from './types';

const requiredKeys: Array<keyof LogEntry> = ['timestamp', 'path', 'status', 'latencyMs'];

const isValidEntry = (entry: any): entry is LogEntry => {
  if (!entry || typeof entry !== 'object') return false;
  return requiredKeys.every((key) => entry[key] !== undefined);
};

export const normalizeEntry = (entry: any): LogEntry | null => {
  if (!isValidEntry(entry)) return null;
  const { timestamp, path, status, latencyMs, service, ...rest } = entry;
  const statusNumber = Number(status);
  const latencyNumber = Number(latencyMs);
  if (Number.isNaN(statusNumber) || Number.isNaN(latencyNumber)) return null;
  return {
    timestamp: String(timestamp),
    path: String(path),
    status: statusNumber,
    latencyMs: latencyNumber,
    service: service ? String(service) : undefined,
    ...rest,
  };
};

export const parseLogs = (content: string): LogEntry[] => {
  const trimmed = content.trim();
  if (!trimmed) return [];

  let rawEntries: any[] = [];
  if (trimmed.startsWith('[')) {
    try {
      rawEntries = JSON.parse(trimmed);
    } catch (error) {
      return [];
    }
  } else {
    const lines = trimmed.split(/\r?\n/).filter((line) => line.trim().length > 0);
    rawEntries = lines.flatMap((line) => {
      try {
        return [JSON.parse(line)];
      } catch (error) {
        return [];
      }
    });
  }

  return rawEntries
    .map((entry) => {
      const normalized = normalizeEntry(entry);
      return normalized;
    })
    .filter((entry): entry is LogEntry => Boolean(entry));
};

export const parseLogLine = (line: string): LogEntry | null => {
  const trimmed = line.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed);
    return normalizeEntry(parsed);
  } catch {
    return null;
  }
};
