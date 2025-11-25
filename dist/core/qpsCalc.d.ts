import { LogEntry, QpsResult } from './types';
export declare const calculateQps: (logs: LogEntry[], groupBy?: "service" | "path") => QpsResult;
