import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { parseLogLine, parseLogs } from './parser';
import { LogEntry } from './types';

const isJsonArrayFile = (filePath: string): boolean => {
  // 파일의 첫 글자가 '[' 인지 아닌지 확인
  // JSON 배열 형식인지 줄 단위 형식인지 구분
  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(1);
    fs.readSync(fd, buffer, 0, 1, 0);
    fs.closeSync(fd);
    return buffer.toString() === '[';
  } catch {
    return false;
  }
};

export const loadLogFileSync = (filePath: string): LogEntry[] => {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    return [];
  }
  const content = fs.readFileSync(resolved, 'utf-8');
  return parseLogs(content);
};

export const loadLogFile = async (filePath: string): Promise<LogEntry[]> => {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) return [];

  if (isJsonArrayFile(resolved)) {
    return loadLogFileSync(resolved);
  }

  const entries: LogEntry[] = [];
  const stream = fs.createReadStream(resolved, { encoding: 'utf-8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of rl) {
    const entry = parseLogLine(line);
    if (entry) entries.push(entry);
  }

  return entries;
};
