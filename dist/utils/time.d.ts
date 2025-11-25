import { LogEntry } from '../core/types';
export declare const toDate: (value: string) => Date | null;
export declare const secondKey: (date: Date) => string;
export declare const sortByTimeDesc: (entries: LogEntry[]) => LogEntry[];
