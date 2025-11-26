import path from 'path';
import { loadLogFile } from '../src/core/loader';
import { analyzeErrors } from '../src/core/errorsCalc';

const samplePath = path.join(__dirname, '..', 'sample-logs', 'traffic-sample.json');

describe('errors', () => {
  it('counts errors and returns recent samples', async () => {
    const logs = await loadLogFile(samplePath);
    const result = analyzeErrors(logs, {}, 3);
    const totalErrors = Object.values(result.counts).reduce((a, b) => a + b, 0);
    expect(totalErrors).toBeGreaterThan(0);
    expect(result.recent.length).toBeLessThanOrEqual(3);
    expect(result.recent[0].status).toBeGreaterThanOrEqual(400);
  });
});
