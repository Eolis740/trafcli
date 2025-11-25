import path from 'path';
import { loadLogFile } from '../src/core/loader';
import { calculateStats } from '../src/core/statsCalc';

const samplePath = path.join(__dirname, '..', 'sample-logs', 'traffic-sample.json');

describe('stats', () => {
  it('calculates breakdown and latency', () => {
    const logs = loadLogFile(samplePath);
    const stats = calculateStats(logs);
    expect(stats.totalRequests).toBe(12);
    expect(stats.statusGroups['2xx']).toBeGreaterThan(0);
    expect(stats.latency.max).toBeGreaterThan(0);
    expect(stats.topEndpoints.length).toBeGreaterThan(0);
  });
});
