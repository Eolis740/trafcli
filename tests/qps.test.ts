import path from 'path';
import { loadLogFile } from '../src/core/loader';
import { calculateQps } from '../src/core/qpsCalc';

const samplePath = path.join(__dirname, '..', 'sample-logs', 'traffic-sample.json');

describe('qps', () => {
  it('calculates qps and peak', () => {
    const logs = loadLogFile(samplePath);
    const result = calculateQps(logs);
    expect(result.averageQps).toBeGreaterThan(0);
    expect(result.peakQps).toBeGreaterThan(0);
    expect(result.series.length).toBeGreaterThan(0);
  });

  it('groups by service', () => {
    const logs = loadLogFile(samplePath);
    const result = calculateQps(logs, 'service');
    expect(result.series.some((p) => p.group === 'auth')).toBe(true);
  });
});
