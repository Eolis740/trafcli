import path from 'path';
import { loadLogFile } from '../src/core/loader';

const samplePath = path.join(__dirname, '..', 'sample-logs', 'traffic-sample.json');

describe('loader', () => {
  it('loads and parses JSON array logs', async () => {
    const logs = await loadLogFile(samplePath);
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0]).toHaveProperty('timestamp');
    expect(logs[0]).toHaveProperty('latencyMs');
  });
});
