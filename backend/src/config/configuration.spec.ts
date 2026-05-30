import 'reflect-metadata';
import configuration from './configuration';
import { validate } from './config.validation';

describe('configuration', () => {
  it('returns config with defaults', () => {
    const cfg = configuration();
    expect(cfg.nodeEnv).toBeDefined();
    expect(cfg.port).toBeDefined();
    expect(cfg.database.host).toBeDefined();
    expect(cfg.jwt.secret).toBeDefined();
    expect(cfg.payment.feePct).toBeGreaterThanOrEqual(0);
    expect(cfg.fileSigningSecret).toBeDefined();
  });

  it('reads from env vars when present', () => {
    process.env.PORT = '4000';
    process.env.PAYMENT_GATEWAY = 'ppay';
    process.env.FILE_SIGNING_SECRET = 'test-secret';
    const cfg = configuration();
    expect(cfg.port).toBe(4000);
    expect(cfg.payment.gateway).toBe('ppay');
    expect(cfg.fileSigningSecret).toBe('test-secret');
    delete process.env.PORT;
    delete process.env.PAYMENT_GATEWAY;
    delete process.env.FILE_SIGNING_SECRET;
  });
});

describe('validate config', () => {
  it('passes valid config', () => {
    const result = validate({
      NODE_ENV: 'test',
      PORT: 3001,
      JWT_SECRET: 'x',
      DB_HOST: 'localhost',
      DB_USERNAME: 'u',
      DB_PASSWORD: 'p',
      DB_DATABASE: 'd',
    });
    expect(result.PORT).toBe(3001);
  });

  it('throws when invalid NODE_ENV', () => {
    expect(() => validate({ NODE_ENV: 'bogus' as any })).toThrow();
  });
});
