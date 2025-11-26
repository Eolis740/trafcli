import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { Command } from 'commander';
import inquirer from 'inquirer';
import readline from 'readline';
import os from 'os';
import pkg from '../../package.json';
import { readConfig, setDefaultFile } from '../config/file';
import { getMessages } from '../i18n';
import { Config, LogEntry } from '../core/types';
import { registerStatsCommand } from './commands/stats';
import { registerErrorsCommand } from './commands/errors';
import { registerQpsCommand } from './commands/qps';
import { registerConfigCommand } from './commands/config';
import { registerSettingCommand, runSettingMenu } from './commands/setting';
import { Messages } from '../i18n/en';
import { loadLogFile, loadLogFileSync } from '../core/loader';
import { calculateStats } from '../core/statsCalc';
import { analyzeErrors } from '../core/errorsCalc';
import { calculateQps } from '../core/qpsCalc';
import { renderTable } from '../utils/table';
import { formatMs, formatNumber, formatPercent } from '../utils/format';
import { logError, logInfo } from '../utils/logger';

export interface CLIContext {
  config: Config;
  messages: Messages;
}

export const buildProgram = (): Command => {
  const program = new Command();
  const config = readConfig();
  const messages = getMessages();
  const ctx: CLIContext = { config, messages };

  program.name('trafcli').description(messages.common.cliDescription).version(pkg.version);

  registerStatsCommand(program, ctx);
  registerErrorsCommand(program, ctx);
  registerQpsCommand(program, ctx);
  registerConfigCommand(program, ctx);
  registerSettingCommand(program, ctx);

  return program;
};

const refreshContext = (): CLIContext => {
  const config = readConfig();
  const messages = getMessages();
  return { config, messages };
};


type FlagMap = Record<string, string | number | boolean>;

const parseFlags = (tokens: string[]): FlagMap => {
  const flags: FlagMap = {};
  for (let i = 0; i < tokens.length; i += 1) {
    const tok = tokens[i];
    if (tok.startsWith('--')) {
      const key = tok.slice(2);
      const next = tokens[i + 1];
      if (next && !next.startsWith('-')) {
        flags[key] = isNaN(Number(next)) ? next : Number(next);
        i += 1;
      } else {
        flags[key] = true;
      }
    } else if (tok === '-f') {
      const val = tokens[i + 1];
      if (val) {
        flags.file = val;
        i += 1;
      }
    } else if (tok === '-i') {
      const val = tokens[i + 1];
      if (val) {
        flags.interval = Number(val);
        i += 1;
      }
    }
  }
  return flags;
};

const fileExists = (candidate: string): boolean => {
  try {
    const stat = fs.statSync(candidate);
    return stat.isFile();
  } catch {
    return false;
  }
};

const autoDetectLogFileSync = (): string | null => {
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
  ].map((p) => path.resolve(cwd, p));

  for (const c of candidates) {
    if (fileExists(c)) return c;
  }
  return null;
};

const globLogCandidates = async (): Promise<string[]> => {
  const cwd = process.cwd();
  const patterns = ['**/traffic*.json', '**/*.ndjson', '**/*.log', '**/*.json'];
  const ignore = [
    '**/node_modules/**',
    '**/dist/**',
    '**/.git/**',
    '**/.turbo/**',
    '**/coverage/**',
  ];
  const matches = await glob(patterns, { cwd, ignore, nodir: true, absolute: true, maxDepth: 6 });
  const uniq = Array.from(new Set(matches));
  return uniq;
};

const pickLogFile = async (): Promise<string | null> => {
  const firstGuess = autoDetectLogFileSync();
  if (firstGuess) return firstGuess;
  const candidates = await globLogCandidates();
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];
  const { chosen } = await inquirer.prompt([
    {
      type: 'list',
      name: 'chosen',
      message: 'Select log file',
      choices: candidates.map((c) => ({ name: path.relative(process.cwd(), c), value: c })),
    },
  ]);
  return chosen;
};

const historyPath = () => path.join(os.homedir(), '.trafcli', 'history');

const loadHistory = (): string[] => {
  try {
    const hp = historyPath();
    if (!fs.existsSync(hp)) return [];
    const content = fs.readFileSync(hp, 'utf-8');
    return content.split(/\r?\n/).filter(Boolean).slice(-500).reverse();
  } catch {
    return [];
  }
};

const appendHistory = (line: string): void => {
  const trimmed = line.trim();
  if (!trimmed) return;
  try {
    const hp = historyPath();
    const dir = path.dirname(hp);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(hp, trimmed + '\n', 'utf-8');
  } catch {
    // ignore history write errors
  }
};

const ensureLogs = async (
  ctx: CLIContext,
  filePath?: string,
): Promise<{ file: string; logs: LogEntry[] } | null> => {
  let targetFile = filePath || ctx.config.defaultFile || autoDetectLogFileSync();
  if (!targetFile) {
    targetFile = await pickLogFile();
  }
  if (!targetFile) {
    logError(ctx.messages.common.missingFile);
    return null;
  }
  const resolved = path.resolve(targetFile);
  if (!fileExists(resolved)) {
    logError(ctx.messages.common.fileNotFound.replace('{file}', resolved));
    return null;
  }
  const logs = await loadLogFile(resolved);
  if (!logs.length) {
    logError(ctx.messages.common.noData);
    return null;
  }
  if (!filePath && !ctx.config.defaultFile) {
    logInfo(`Auto-detected log file: ${resolved}`);
  }
  return { file: resolved, logs };
};

const startShellSession = async (): Promise<void> => {
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
  const flagHints: Record<string, string[]> = {
    stats: ['--watch', '--interval', '--file', '--top', '--all'],
    errors: ['--status', '--path', '--service', '--limit', '--file'],
    qps: ['--group-by', '--file'],
    search: ['--path', '--service', '--status', '--limit', '--file'],
    config: ['show', 'reset', 'set-file'],
  };

  const safeLoadForCompletion = (): LogEntry[] => {
    const ctx = refreshContext();
    const guess = ctx.config.defaultFile || autoDetectLogFileSync();
    if (!guess) return [];
    try {
      return loadLogFileSync(path.resolve(guess));
    } catch {
      return [];
    }
  };

  const dynamicSuggestions = (): string[] => {
    const logs = safeLoadForCompletion();
    const paths = new Set<string>();
    const services = new Set<string>();
    const statuses = new Set<string>();
    logs.forEach((l) => {
      paths.add(l.path);
      if (l.service) services.add(l.service);
      statuses.add(String(l.status));
    });
    return [...Array.from(paths), ...Array.from(services), ...Array.from(statuses)].slice(0, 200);
  };

  const completer = (line: string): [string[], string] => {
    const tokens = line.trim().split(/\s+/).filter(Boolean);
    const last = line.endsWith(' ') ? '' : (tokens[tokens.length - 1] ?? '');
    const cmd = tokens[0] ?? '';

    let suggestions: string[] = [];
    if (tokens.length <= 1) {
      suggestions = baseCommands;
    } else if (flagHints[cmd]) {
      suggestions = [...flagHints[cmd], ...dynamicSuggestions()];
    } else {
      suggestions = dynamicSuggestions();
    }

    const uniq = Array.from(new Set(suggestions));
    const hits = uniq.filter((s) => s.startsWith(last));
    const pick = hits.length === 0 ? uniq : hits;
    const single = pick.length > 0 ? [pick[0]] : [];
    return [single, last];
  };

  console.log('trafcli shell. Type "help" for commands. Ctrl+C to exit.');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    completer,
    history: loadHistory(),
    historySize: 500,
  });

  let activeInterval: NodeJS.Timeout | null = null;

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
    } else {
      rl.close();
    }
  });

  const prompt = () =>
    rl.question('trafcli> ', async (line) => {
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
        console.log(
          '  errors [--status <code>] [--path <sub>] [--service <name>] [--limit <n>] [--file <path>]',
        );
        console.log('  qps [--group-by service|path] [--file <path>]');
        console.log('  setting (opens settings menu)');
        console.log('  config show|reset|set-file <path>');
        console.log(
          '  search <keyword> [--path <sub>] [--service <name>] [--status <code>] [--limit <n>] [--file <path>]',
        );
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
          console.log(JSON.stringify(readConfig(), null, 2));
        } else if (sub === 'reset') {
          // Soft reset: re-write default config via setDefaultFile with undefined and lang enforced by getMessages.
          setDefaultFile('');
          logInfo(ctx.messages.common.configReset);
        } else if (sub === 'set-file' && rest[1]) {
          setDefaultFile(rest[1]);
          logInfo(ctx.messages.common.configSaved);
        } else {
          logError('Usage: config show|reset|set-file <path>');
        }
        prompt();
        return;
      }

      if (cmd === 'setting') {
        await runSettingMenu(ctx);
        prompt();
        return;
      }

      if (cmd === 'stats') {
        const target = await ensureLogs(ctx, flags.file as string | undefined);
        if (!target) {
          prompt();
          return;
        }
        const isWatch = Boolean(flags.watch);
        const render = async () => {
          const refreshed = await ensureLogs(ctx, target.file);
          if (!refreshed) return false;
          const { logs, file } = refreshed;
          const stats = calculateStats(logs);
          const statusTable = renderTable(
            [
              { name: ctx.messages.stats.colStatus },
              { name: ctx.messages.stats.colCount, alignment: 'right' },
              { name: '%' },
            ],
            Object.entries(stats.statusGroups).map(([key, count]) => [
              ctx.messages.stats.statuses[key] ?? key,
              formatNumber(count),
              stats.totalRequests ? formatPercent(count / stats.totalRequests) : '0%',
            ]),
          );
          const latencyTable = renderTable(
            [
              { name: ctx.messages.stats.average },
              { name: ctx.messages.stats.max },
              { name: ctx.messages.stats.p95 },
              { name: ctx.messages.stats.p99 },
            ],
            [
              [
                formatMs(stats.latency.avg),
                formatMs(stats.latency.max),
                formatMs(stats.latency.p95),
                formatMs(stats.latency.p99),
              ],
            ],
          );
          const endpointTable = renderTable(
            [
              { name: ctx.messages.stats.colPath },
              { name: ctx.messages.stats.colCount, alignment: 'right' },
            ],
            stats.topEndpoints.map((item) => [item.path, formatNumber(item.count)]),
          );
          console.clear();
          logInfo(`File: ${file}`);
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
          logInfo(ctx.messages.common.watchStart);
          const intervalMs = Math.max(1, Number(flags.interval) || 2) * 1000;
          stopActiveInterval();
          activeInterval = setInterval(() => {
            void render();
          }, intervalMs);
          // 트래픽 스트리밍 중 에도 Ctrl+C로 멈출 수 있게
          //트래픽 스트리밍 중 에도 명령어 입력 가능하게
          rl.prompt(true);
        } else {
          prompt();
        }
        return;
      }

      if (cmd === 'errors') {
        const target = await ensureLogs(ctx, flags.file as string | undefined);
        if (!target) {
          prompt();
          return;
        }
        const filtered = analyzeErrors(
          target.logs,
          {
            status: flags.status ? Number(flags.status) : undefined,
            path: flags.path ? String(flags.path) : undefined,
            service: flags.service ? String(flags.service) : undefined,
          },
          flags.limit ? Number(flags.limit) : 5,
        );
        if (filtered.recent.length === 0) {
          logInfo(ctx.messages.errors.noErrors);
          prompt();
          return;
        }
        const countTable = renderTable(
          [
            { name: ctx.messages.errors.colStatus },
            { name: ctx.messages.stats.colCount, alignment: 'right' },
          ],
          Object.entries(filtered.counts)
            .sort((a, b) => Number(b[0]) - Number(a[0]))
            .map(([statusCode, count]) => [statusCode, formatNumber(count)]),
        );
        const sampleTable = renderTable(
          [
            { name: ctx.messages.errors.colStatus },
            { name: ctx.messages.errors.colPath },
            { name: ctx.messages.errors.colService },
            { name: ctx.messages.errors.colTime },
            { name: ctx.messages.errors.colLatency, alignment: 'right' },
          ],
          filtered.recent.map((log) => [
            String(log.status),
            log.path,
            log.service ?? '-',
            log.timestamp,
            log.latencyMs,
          ]),
        );
        console.clear();
        logInfo(`File: ${target.file}`);
        console.log(countTable);
        console.log(sampleTable);
        prompt();
        return;
      }

      if (cmd === 'search') {
        const target = await ensureLogs(ctx, flags.file as string | undefined);
        if (!target) {
          prompt();
          return;
        }
        const keyword = rest.find((t) => !t.startsWith('-')) || '';
        if (!keyword) {
          logError(
            'Usage: search <keyword> [--path <sub>] [--service <name>] [--status <code>] [--limit <n>]',
          );
          prompt();
          return;
        }
        const kwLower = keyword.toLowerCase();
        const limit = flags.limit ? Number(flags.limit) : 20;
        const filtered = target.logs.filter((log) => {
          if (flags.status && log.status !== Number(flags.status)) return false;
          if (flags.path && !log.path.includes(String(flags.path))) return false;
          if (flags.service && log.service !== String(flags.service)) return false;
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
        const table = renderTable(
          [
            { name: ctx.messages.errors.colStatus },
            { name: ctx.messages.errors.colPath },
            { name: ctx.messages.errors.colService },
            { name: ctx.messages.errors.colTime },
            { name: ctx.messages.errors.colLatency, alignment: 'right' },
          ],
          rows,
        );
        console.clear();
        logInfo(`File: ${target.file}`);
        console.log(`Search: "${keyword}" (matched ${filtered.length})`);
        console.log(table);
        prompt();
        return;
      }

      if (cmd === 'qps') {
        const target = await ensureLogs(ctx, flags.file as string | undefined);
        if (!target) {
          prompt();
          return;
        }
        const result = calculateQps(
          target.logs,
          flags['group-by'] ? (String(flags['group-by']) as 'service' | 'path') : undefined,
        );
        const seriesTable = renderTable(
          [
            { name: ctx.messages.qps.colTime },
            { name: ctx.messages.qps.colGroup },
            { name: ctx.messages.qps.colCount, alignment: 'right' },
          ],
          result.series.map((item) => [item.time, item.group ?? '-', formatNumber(item.count)]),
        );
        console.clear();
        logInfo(`File: ${target.file}`);
        console.log(`${ctx.messages.qps.averageQps}: ${formatMs(result.averageQps)}`);
        console.log(`${ctx.messages.qps.peakQps}: ${formatMs(result.peakQps)}`);
        console.log(seriesTable);
        prompt();
        return;
      }

      logError('Unknown command. Type "help" for list.');
      prompt();
    });

  prompt();
};

export const run = async (): Promise<void> => {
  if (process.argv.length <= 2) {
    await startShellSession();
    return;
  }
  const program = buildProgram();
  await program.parseAsync(process.argv);
};
