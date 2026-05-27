import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns ok with timestamp', () => {
    const c = new HealthController();
    const result = c.check();
    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
  });
});
