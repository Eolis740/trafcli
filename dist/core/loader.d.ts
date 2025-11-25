import { LogEntry } from './types';
export declare const loadLogFileSync: (filePath: string) => LogEntry[];
export declare const loadLogFile: (filePath: string) => Promise<LogEntry[]>;
