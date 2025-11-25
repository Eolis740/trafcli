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
declare const en: Messages;
export default en;
