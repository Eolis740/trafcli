import path from 'path';
import { loadLogFile } from '../src/core/loader';
import { filterLogs } from '../src/core/filter';

const samplePath = path.join(__dirname, '..', 'sample-logs', 'traffic-sample.json');

const load = () => loadLogFile(samplePath);

describe('filter', () => {
  it('filters by status', () => {
    const logs = filterLogs(load(), { status: 200 });
    expect(logs.every((l) => l.status === 200)).toBe(true);
  });

  it('filters by path substring', () => {
    const logs = filterLogs(load(), { path: '/api/login' });
    expect(logs.every((l) => l.path.includes('/api/login'))).toBe(true);
  });

  it('filters by service', () => {
    const logs = filterLogs(load(), { service: 'billing' });
    expect(logs.length).toBeGreaterThan(0);
    expect(logs.every((l) => l.service === 'billing')).toBe(true);
  });
});
