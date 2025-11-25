export type Locale = 'en' | 'ko' | 'ja' | 'zh-CN' | 'es';

export interface LogEntry {
  timestamp: string;
  path: string;
  status: number;
  latencyMs: number;
  service?: string;
  [key: string]: unknown;
}

export interface Config {
  lang: Locale;
  defaultFile?: string;
}

export interface FilterOptions {
  status?: number;
  path?: string;
  service?: string;
}

export interface StatsResult {
  totalRequests: number;
  statusGroups: Record<string, number>;
  latency: {
    avg: number;
    max: number;
    p95: number;
    p99: number;
  };
  topEndpoints: Array<{ path: string; count: number }>;
}

export interface ErrorAnalysis {
  counts: Record<number, number>;
  recent: LogEntry[];
}

export interface QpsPoint {
  time: string;
  group?: string;
  count: number;
}

export interface QpsResult {
  averageQps: number;
  peakQps: number;
  series: QpsPoint[];
}
