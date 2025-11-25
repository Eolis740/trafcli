import { LogEntry } from './types';
export declare const normalizeEntry: (entry: any) => LogEntry | null;
export declare const parseLogs: (content: string) => LogEntry[];
export declare const parseLogLine: (line: string) => LogEntry | null;
