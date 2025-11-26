import { Locale } from '../core/types';

export interface Messages {
  common: {
    cliDescription: string;
    usingFile: string;
    fileNotFound: string;
    noData: string;
    invalidLog: string;
    promptFile: string;
    promptLang: string;
    configSaved: string;
    configReset: string;
    missingFile: string;
    readError: string;
    configPath: string;
    invalidFormat: string;
    langLabel: string;
    fileLabel: string;
    sampleLimit: string;
    fileOption: string;
    statusOption: string;
    pathOption: string;
    serviceOption: string;
    groupOption: string;
    limitOption: string;
    watchOption: string;
    intervalOption: string;
    watchStart: string;
  };
  stats: {
    title: string;
    totalRequests: string;
    statusBreakdown: string;
    latencySummary: string;
    topEndpoints: string;
    colStatus: string;
    colCount: string;
    colPath: string;
    average: string;
    max: string;
    p95: string;
    p99: string;
    statuses: Record<string, string>;
  };
  errors: {
    title: string;
    noErrors: string;
    errorCounts: string;
    recentSamples: string;
    colStatus: string;
    colPath: string;
    colService: string;
    colTime: string;
    colLatency: string;
  };
  qps: {
    title: string;
    averageQps: string;
    peakQps: string;
    colTime: string;
    colCount: string;
    colGroup: string;
  };
  config: {
    title: string;
    showing: string;
    saved: string;
    reset: string;
    menuTitle: string;
    setLanguage: string;
    setFile: string;
    back: string;
  };
  interactive: {
    title: string;
    selectAction: string;
    exit: string;
    actions: {
      stats: string;
      errors: string;
      qps: string;
      settings: string;
    };
  };
}

const en: Messages = {
  common: {
    cliDescription: 'Traffic Insight CLI for JSON/NDJSON logs',
    usingFile: 'Using log file: {file}',
    fileNotFound: 'Log file not found: {file}',
    noData: 'No log entries found.',
    invalidLog: 'Invalid log entry skipped.',
    promptFile: 'Default log file path',
    promptLang: 'Preferred language',
    configSaved: 'Configuration saved.',
    configReset: 'Configuration reset to defaults.',
    missingFile: 'Provide a log file via --file or set default with config.',
    readError: 'Failed to read log file.',
    configPath: 'Config path: {path}',
    invalidFormat: 'Unsupported log format.',
    langLabel: 'Language',
    fileLabel: 'Log file',
    sampleLimit: 'Sample size',
    fileOption: 'Log file path',
    statusOption: 'HTTP status code',
    pathOption: 'Filter by path substring',
    serviceOption: 'Filter by service',
    groupOption: 'Group by service or path',
    limitOption: 'Sample size',
    watchOption: 'Watch for updates',
    intervalOption: 'Refresh interval (sec)',
    watchStart: 'Watching for updates... press Ctrl+C to stop.',
  },
  stats: {
    title: 'Traffic Stats',
    totalRequests: 'Total Requests',
    statusBreakdown: 'Status Breakdown',
    latencySummary: 'Latency (ms)',
    topEndpoints: 'Top Endpoints',
    colStatus: 'Status',
    colCount: 'Count',
    colPath: 'Path',
    average: 'Avg',
    max: 'Max',
    p95: 'p95',
    p99: 'p99',
    statuses: { '2xx': '2xx', '4xx': '4xx', '5xx': '5xx', other: 'Other' },
  },
  errors: {
    title: 'Error Analysis',
    noErrors: 'No error logs found.',
    errorCounts: 'Error counts by status',
    recentSamples: 'Recent error samples',
    colStatus: 'Status',
    colPath: 'Path',
    colService: 'Service',
    colTime: 'Time',
    colLatency: 'Latency(ms)',
  },
  qps: {
    title: 'QPS',
    averageQps: 'Average QPS',
    peakQps: 'Peak QPS',
    colTime: 'Time',
    colCount: 'Count',
    colGroup: 'Group',
  },
  config: {
    title: 'Config',
    showing: 'Current config',
    saved: 'Saved config.',
    reset: 'Reset config.',
    menuTitle: 'Configure trafcli',
    setLanguage: 'Set language',
    setFile: 'Set default log file',
    back: 'Back',
  },
  interactive: {
    title: 'Traffic Insight CLI',
    selectAction: 'Choose an action',
    exit: 'Exit',
    actions: {
      stats: 'View stats',
      errors: 'Analyze errors',
      qps: 'View QPS',
      settings: 'Settings',
    },
  },
};

export default en;
