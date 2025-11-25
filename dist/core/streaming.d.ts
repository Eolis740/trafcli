import { LogEntry, QpsResult, StatsResult, ErrorAnalysis, FilterOptions } from './types';
export interface StreamResult<T> {
    result: T | null;
    offset: number;
}
export declare const aggregateStatsStream: (filePath: string, offset?: number) => Promise<StreamResult<StatsResult>>;
export declare const aggregateErrorsStream: (filePath: string, filters: FilterOptions, recent: number, offset?: number) => Promise<StreamResult<ErrorAnalysis>>;
export declare const aggregateQpsStream: (filePath: string, groupBy?: "service" | "path", offset?: number) => Promise<StreamResult<QpsResult>>;
export declare const aggregateSearchStream: (filePath: string, keyword: string, filters: FilterOptions, limit: number, offset?: number) => Promise<StreamResult<LogEntry[]>>;
