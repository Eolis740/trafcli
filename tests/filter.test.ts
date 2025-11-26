import path from 'path';
import { loadLogFile } from '../src/core/loader';
import { filterLogs } from '../src/core/filter';

const samplePath = path.join(__dirname, '..', 'sample-logs', 'traffic-sample.json');

describe('filter', () => {
  it('filters by status', async () => {
    const logs = filterLogs(await loadLogFile(samplePath), { status: 200 });
    expect(logs.every((l) => l.status === 200)).toBe(true);
  });

  it('filters by path substring', async () => {
    const logs = filterLogs(await loadLogFile(samplePath), { path: '/api/login' });
    expect(logs.every((l) => l.path.includes('/api/login'))).toBe(true);
  });

  it('filters by service', async () => {
    const logs = filterLogs(await loadLogFile(samplePath), { service: 'billing' });
    expect(logs.length).toBeGreaterThan(0);
    expect(logs.every((l) => l.service === 'billing')).toBe(true);
  });
});
