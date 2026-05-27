import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let users: any;
  const config: any = { get: jest.fn(() => 'secret') };

  beforeEach(() => {
    users = { findById: jest.fn() };
    strategy = new JwtStrategy(config, users);
  });

  it('returns user when found', async () => {
    users.findById.mockResolvedValue({ id: 'u' });
    const result = await strategy.validate({ sub: 'u', email: 'a@b.com', role: 'buyer' });
    expect(result.id).toBe('u');
  });

  it('throws UnauthorizedException when user not found', async () => {
    users.findById.mockResolvedValue(null);
    await expect(strategy.validate({ sub: 'u', email: 'a@b.com', role: 'buyer' })).rejects.toThrow(UnauthorizedException);
  });
});
