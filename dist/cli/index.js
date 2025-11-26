"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.buildProgram = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const glob_1 = require("glob");
const commander_1 = require("commander");
const inquirer_1 = __importDefault(require("inquirer"));
const readline_1 = __importDefault(require("readline"));
const os_1 = __importDefault(require("os"));
const package_json_1 = __importDefault(require("../../package.json"));
const file_1 = require("../config/file");
const i18n_1 = require("../i18n");
const stats_1 = require("./commands/stats");
const errors_1 = require("./commands/errors");
const qps_1 = require("./commands/qps");
const config_1 = require("./commands/config");
const setting_1 = require("./commands/setting");
const loader_1 = require("../core/loader");
const statsCalc_1 = require("../core/statsCalc");
const errorsCalc_1 = require("../core/errorsCalc");
const qpsCalc_1 = require("../core/qpsCalc");
const table_1 = require("../utils/table");
const format_1 = require("../utils/format");
const logger_1 = require("../utils/logger");
const buildProgram = () => {
    const program = new commander_1.Command();
    const config = (0, file_1.readConfig)();
    const messages = (0, i18n_1.getMessages)();
    const ctx = { config, messages };
    program.name('trafcli').description(messages.common.cliDescription).version(package_json_1.default.version);
    (0, stats_1.registerStatsCommand)(program, ctx);
    (0, errors_1.registerErrorsCommand)(program, ctx);
    (0, qps_1.registerQpsCommand)(program, ctx);
    (0, config_1.registerConfigCommand)(program, ctx);
    (0, setting_1.registerSettingCommand)(program, ctx);
    return program;
};
exports.buildProgram = buildProgram;
const refreshContext = () => {
    const config = (0, file_1.readConfig)();
    const messages = (0, i18n_1.getMessages)();
    return { config, messages };
};
const parseFlags = (tokens) => {
    const flags = {};
    for (let i = 0; i < tokens.length; i += 1) {
        const tok = tokens[i];
        if (tok.startsWith('--')) {
            const key = tok.slice(2);
            const next = tokens[i + 1];
            if (next && !next.startsWith('-')) {
                flags[key] = isNaN(Number(next)) ? next : Number(next);
                i += 1;
            }
            else {
                flags[key] = true;
            }
        }
        else if (tok === '-f') {
            const val = tokens[i + 1];
            if (val) {
                flags.file = val;
                i += 1;
            }
        }
        else if (tok === '-i') {
            const val = tokens[i + 1];
            if (val) {
                flags.interval = Number(val);
                i += 1;
            }
        }
    }
    return flags;
};
const fileExists = (candidate) => {
    try {
        const stat = fs_1.default.statSync(candidate);
        return stat.isFile();
    }
    catch {
        return false;
    }
};
const autoDetectLogFileSync = () => {
    const cwd = process.cwd();
    const candidates = [
        'sample-logs/traffic-sample.json',
        'traffic-sample.json',
        'traffic.json',
        'traffic.ndjson',
        'traffic.log',
        'logs/traffic.json',
        'logs/traffic.ndjson',
        'logs/traffic.log',
        'log/traffic.json',
        'log/traffic.ndjson',
        'log/traffic.log',
    ].map((p) => path_1.default.resolve(cwd, p));
    for (const c of candidates) {
        if (fileExists(c))
            return c;
    }
    return null;
};
const globLogCandidates = async () => {
    const cwd = process.cwd();
    const patterns = ['**/traffic*.json', '**/*.ndjson', '**/*.log', '**/*.json'];
    const ignore = [
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        '**/.turbo/**',
        '**/coverage/**',
    ];
    const matches = await (0, glob_1.glob)(patterns, { cwd, ignore, nodir: true, absolute: true, maxDepth: 6 });
    const uniq = Array.from(new Set(matches));
    return uniq;
};
const pickLogFile = async () => {
    const firstGuess = autoDetectLogFileSync();
    if (firstGuess)
        return firstGuess;
    const candidates = await globLogCandidates();
    if (candidates.length === 0)
        return null;
    if (candidates.length === 1)
        return candidates[0];
    const { chosen } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'chosen',
            message: 'Select log file',
            choices: candidates.map((c) => ({ name: path_1.default.relative(process.cwd(), c), value: c })),
        },
    ]);
    return chosen;
};
const historyPath = () => path_1.default.join(os_1.default.homedir(), '.trafcli', 'history');
const loadHistory = () => {
    try {
        const hp = historyPath();
        if (!fs_1.default.existsSync(hp))
            return [];
        const content = fs_1.default.readFileSync(hp, 'utf-8');
        return content.split(/\r?\n/).filter(Boolean).slice(-500).reverse();
    }
    catch {
        return [];
    }
};
const appendHistory = (line) => {
    const trimmed = line.trim();
    if (!trimmed)
        return;
    try {
        const hp = historyPath();
        const dir = path_1.default.dirname(hp);
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir, { recursive: true });
        fs_1.default.appendFileSync(hp, trimmed + '\n', 'utf-8');
    }
    catch {
        // ignore history write errors
    }
};
const ensureLogs = async (ctx, filePath) => {
    let targetFile = filePath || ctx.config.defaultFile || autoDetectLogFileSync();
    if (!targetFile) {
        targetFile = await pickLogFile();
    }
    if (!targetFile) {
        (0, logger_1.logError)(ctx.messages.common.missingFile);
        return null;
    }
    const resolved = path_1.default.resolve(targetFile);
    if (!fileExists(resolved)) {
        (0, logger_1.logError)(ctx.messages.common.fileNotFound.replace('{file}', resolved));
        return null;
    }
    const logs = await (0, loader_1.loadLogFile)(resolved);
    if (!logs.length) {
        (0, logger_1.logError)(ctx.messages.common.noData);
        return null;
    }
    if (!filePath && !ctx.config.defaultFile) {
        (0, logger_1.logInfo)(`Auto-detected log file: ${resolved}`);
    }
    return { file: resolved, logs };
};
const startShellSession = async () => {
    const baseCommands = [
        'stats',
        'errors',
        'qps',
        'config',
        'setting',
        'search',
        'clear',
        'cls',
        'help',
        'exit',
        'quit',
    ];
    const flagHints = {
        stats: ['--watch', '--interval', '--file', '--top', '--all'],
        errors: ['--status', '--path', '--service', '--limit', '--file'],
        qps: ['--group-by', '--file'],
        search: ['--path', '--service', '--status', '--limit', '--file'],
        config: ['show', 'reset', 'set-file'],
    };
    const safeLoadForCompletion = () => {
        const ctx = refreshContext();
        const guess = ctx.config.defaultFile || autoDetectLogFileSync();
        if (!guess)
            return [];
        try {
            return (0, loader_1.loadLogFileSync)(path_1.default.resolve(guess));
        }
        catch {
            return [];
        }
    };
    const dynamicSuggestions = () => {
        const logs = safeLoadForCompletion();
        const paths = new Set();
        const services = new Set();
        const statuses = new Set();
        logs.forEach((l) => {
            paths.add(l.path);
            if (l.service)
                services.add(l.service);
            statuses.add(String(l.status));
        });
        return [...Array.from(paths), ...Array.from(services), ...Array.from(statuses)].slice(0, 200);
    };
    const completer = (line) => {
        const tokens = line.trim().split(/\s+/).filter(Boolean);
        const last = line.endsWith(' ') ? '' : (tokens[tokens.length - 1] ?? '');
        const cmd = tokens[0] ?? '';
        let suggestions = [];
        if (tokens.length <= 1) {
            suggestions = baseCommands;
        }
        else if (flagHints[cmd]) {
            suggestions = [...flagHints[cmd], ...dynamicSuggestions()];
        }
        else {
            suggestions = dynamicSuggestions();
        }
        const uniq = Array.from(new Set(suggestions));
        const hits = uniq.filter((s) => s.startsWith(last));
        const pick = hits.length === 0 ? uniq : hits;
        const single = pick.length > 0 ? [pick[0]] : [];
        return [single, last];
    };
    console.log('trafcli shell. Type "help" for commands. Ctrl+C to exit.');
    const rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
        completer,
        history: loadHistory(),
        historySize: 500,
    });
    let activeInterval = null;
    const stopActiveInterval = () => {
        if (activeInterval) {
            clearInterval(activeInterval);
            activeInterval = null;
            console.log('\nStopped watch.');
        }
    };
    rl.on('SIGINT', () => {
        if (activeInterval) {
            stopActiveInterval();
            prompt();
        }
        else {
            rl.close();
        }
    });
    const prompt = () => rl.question('trafcli> ', async (line) => {
        appendHistory(line);
        const ctx = refreshContext();
        const tokens = line.trim().split(/\s+/).filter(Boolean);
        if (tokens.length === 0) {
            prompt();
            return;
        }
        const [first, ...restTokens] = tokens;
        let cmd = first ?? '';
        const rest = [...restTokens];
        if (cmd === 'trafcli') {
            cmd = rest.shift() ?? '';
        }
        const flags = parseFlags(rest);
        if (cmd === 'exit' || cmd === 'quit') {
            rl.close();
            return;
        }
        if (cmd === 'help') {
            console.log('Commands:');
            console.log('  stats [--watch] [--interval <sec>] [--file <path>]');
            console.log('  errors [--status <code>] [--path <sub>] [--service <name>] [--limit <n>] [--file <path>]');
            console.log('  qps [--group-by service|path] [--file <path>]');
            console.log('  setting (opens settings menu)');
            console.log('  config show|reset|set-file <path>');
            console.log('  search <keyword> [--path <sub>] [--service <name>] [--status <code>] [--limit <n>] [--file <path>]');
            console.log('  clear');
            console.log('  help');
            console.log('  exit');
            prompt();
            return;
        }
        if (cmd === 'clear' || cmd === 'cls') {
            console.clear();
            prompt();
            return;
        }
        if (cmd === 'config') {
            const sub = rest[0];
            if (sub === 'show') {
                console.log(JSON.stringify((0, file_1.readConfig)(), null, 2));
            }
            else if (sub === 'reset') {
                // Soft reset: re-write default config via setDefaultFile with undefined and lang enforced by getMessages.
                (0, file_1.setDefaultFile)('');
                (0, logger_1.logInfo)(ctx.messages.common.configReset);
            }
            else if (sub === 'set-file' && rest[1]) {
                (0, file_1.setDefaultFile)(rest[1]);
                (0, logger_1.logInfo)(ctx.messages.common.configSaved);
            }
            else {
                (0, logger_1.logError)('Usage: config show|reset|set-file <path>');
            }
            prompt();
            return;
        }
        if (cmd === 'setting') {
            await (0, setting_1.runSettingMenu)(ctx);
            prompt();
            return;
        }
        if (cmd === 'stats') {
            const target = await ensureLogs(ctx, flags.file);
            if (!target) {
                prompt();
                return;
            }
            const isWatch = Boolean(flags.watch);
            const render = async () => {
                const refreshed = await ensureLogs(ctx, target.file);
                if (!refreshed)
                    return false;
                const { logs, file } = refreshed;
                const stats = (0, statsCalc_1.calculateStats)(logs);
                const statusTable = (0, table_1.renderTable)([
                    { name: ctx.messages.stats.colStatus },
                    { name: ctx.messages.stats.colCount, alignment: 'right' },
                    { name: '%' },
                ], Object.entries(stats.statusGroups).map(([key, count]) => [
                    ctx.messages.stats.statuses[key] ?? key,
                    (0, format_1.formatNumber)(count),
                    stats.totalRequests ? (0, format_1.formatPercent)(count / stats.totalRequests) : '0%',
                ]));
                const latencyTable = (0, table_1.renderTable)([
                    { name: ctx.messages.stats.average },
                    { name: ctx.messages.stats.max },
                    { name: ctx.messages.stats.p95 },
                    { name: ctx.messages.stats.p99 },
                ], [
                    [
                        (0, format_1.formatMs)(stats.latency.avg),
                        (0, format_1.formatMs)(stats.latency.max),
                        (0, format_1.formatMs)(stats.latency.p95),
                        (0, format_1.formatMs)(stats.latency.p99),
                    ],
                ]);
                const endpointTable = (0, table_1.renderTable)([
                    { name: ctx.messages.stats.colPath },
                    { name: ctx.messages.stats.colCount, alignment: 'right' },
                ], stats.topEndpoints.map((item) => [item.path, (0, format_1.formatNumber)(item.count)]));
                console.clear();
                (0, logger_1.logInfo)(`File: ${file}`);
                console.log(statusTable);
                console.log(latencyTable);
                console.log(endpointTable);
                if (isWatch) {
                    rl.prompt(true);
                }
                return true;
            };
            const ok = await render();
            if (!ok) {
                prompt();
                return;
            }
            if (isWatch) {
                (0, logger_1.logInfo)(ctx.messages.common.watchStart);
                const intervalMs = Math.max(1, Number(flags.interval) || 2) * 1000;
                stopActiveInterval();
                activeInterval = setInterval(() => {
                    void render();
                }, intervalMs);
                // 트래픽 스트리밍 중 에도 Ctrl+C로 멈출 수 있게
                //트래픽 스트리밍 중 에도 명령어 입력 가능하게
                rl.prompt(true);
            }
            else {
                prompt();
            }
            return;
        }
        if (cmd === 'errors') {
            const target = await ensureLogs(ctx, flags.file);
            if (!target) {
                prompt();
                return;
            }
            const filtered = (0, errorsCalc_1.analyzeErrors)(target.logs, {
                status: flags.status ? Number(flags.status) : undefined,
                path: flags.path ? String(flags.path) : undefined,
                service: flags.service ? String(flags.service) : undefined,
            }, flags.limit ? Number(flags.limit) : 5);
            if (filtered.recent.length === 0) {
                (0, logger_1.logInfo)(ctx.messages.errors.noErrors);
                prompt();
                return;
            }
            const countTable = (0, table_1.renderTable)([
                { name: ctx.messages.errors.colStatus },
                { name: ctx.messages.stats.colCount, alignment: 'right' },
            ], Object.entries(filtered.counts)
                .sort((a, b) => Number(b[0]) - Number(a[0]))
                .map(([statusCode, count]) => [statusCode, (0, format_1.formatNumber)(count)]));
            const sampleTable = (0, table_1.renderTable)([
                { name: ctx.messages.errors.colStatus },
                { name: ctx.messages.errors.colPath },
                { name: ctx.messages.errors.colService },
                { name: ctx.messages.errors.colTime },
                { name: ctx.messages.errors.colLatency, alignment: 'right' },
            ], filtered.recent.map((log) => [
                String(log.status),
                log.path,
                log.service ?? '-',
                log.timestamp,
                log.latencyMs,
            ]));
            console.clear();
            (0, logger_1.logInfo)(`File: ${target.file}`);
            console.log(countTable);
            console.log(sampleTable);
            prompt();
            return;
        }
        if (cmd === 'search') {
            const target = await ensureLogs(ctx, flags.file);
            if (!target) {
                prompt();
                return;
            }
            const keyword = rest.find((t) => !t.startsWith('-')) || '';
            if (!keyword) {
                (0, logger_1.logError)('Usage: search <keyword> [--path <sub>] [--service <name>] [--status <code>] [--limit <n>]');
                prompt();
                return;
            }
            const kwLower = keyword.toLowerCase();
            const limit = flags.limit ? Number(flags.limit) : 20;
            const filtered = target.logs.filter((log) => {
                if (flags.status && log.status !== Number(flags.status))
                    return false;
                if (flags.path && !log.path.includes(String(flags.path)))
                    return false;
                if (flags.service && log.service !== String(flags.service))
                    return false;
                return JSON.stringify(log).toLowerCase().includes(kwLower);
            });
            const rows = filtered
                .slice(0, Number.isFinite(limit) ? limit : 20)
                .map((log) => [
                String(log.status),
                log.path,
                log.service ?? '-',
                log.timestamp,
                log.latencyMs,
            ]);
            const table = (0, table_1.renderTable)([
                { name: ctx.messages.errors.colStatus },
                { name: ctx.messages.errors.colPath },
                { name: ctx.messages.errors.colService },
                { name: ctx.messages.errors.colTime },
                { name: ctx.messages.errors.colLatency, alignment: 'right' },
            ], rows);
            console.clear();
            (0, logger_1.logInfo)(`File: ${target.file}`);
            console.log(`Search: "${keyword}" (matched ${filtered.length})`);
            console.log(table);
            prompt();
            return;
        }
        if (cmd === 'qps') {
            const target = await ensureLogs(ctx, flags.file);
            if (!target) {
                prompt();
                return;
            }
            const result = (0, qpsCalc_1.calculateQps)(target.logs, flags['group-by'] ? String(flags['group-by']) : undefined);
            const seriesTable = (0, table_1.renderTable)([
                { name: ctx.messages.qps.colTime },
                { name: ctx.messages.qps.colGroup },
                { name: ctx.messages.qps.colCount, alignment: 'right' },
            ], result.series.map((item) => [item.time, item.group ?? '-', (0, format_1.formatNumber)(item.count)]));
            console.clear();
            (0, logger_1.logInfo)(`File: ${target.file}`);
            console.log(`${ctx.messages.qps.averageQps}: ${(0, format_1.formatMs)(result.averageQps)}`);
            console.log(`${ctx.messages.qps.peakQps}: ${(0, format_1.formatMs)(result.peakQps)}`);
            console.log(seriesTable);
            prompt();
            return;
        }
        (0, logger_1.logError)('Unknown command. Type "help" for list.');
        prompt();
    });
    prompt();
};
const run = async () => {
    if (process.argv.length <= 2) {
        await startShellSession();
        return;
    }
    const program = (0, exports.buildProgram)();
    await program.parseAsync(process.argv);
};
exports.run = run;
//# sourceMappingURL=index.js.map