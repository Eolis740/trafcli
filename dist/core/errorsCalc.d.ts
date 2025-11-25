import { FilterOptions, ErrorAnalysis, LogEntry } from './types';
export declare const analyzeErrors: (logs: LogEntry[], filters?: FilterOptions, recent?: number) => ErrorAnalysis;
