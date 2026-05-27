import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

const makeContext = (user?: any): ExecutionContext => ({
  getHandler: () => 'h',
  getClass: () => 'c',
  switchToHttp: () => ({ getRequest: () => ({ user }) }),
} as any);

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('allows when no roles required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined as any);
    expect(guard.canActivate(makeContext({ role: 'buyer' }))).toBe(true);
  });

  it('allows when empty roles array', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
    expect(guard.canActivate(makeContext({ role: 'buyer' }))).toBe(true);
  });

  it('throws ForbiddenException when no user', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    expect(() => guard.canActivate(makeContext())).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when role not included', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    expect(() => guard.canActivate(makeContext({ role: 'buyer' }))).toThrow(ForbiddenException);
  });

  it('allows when role matches', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
    expect(guard.canActivate(makeContext({ role: 'admin' }))).toBe(true);
  });
});

describe('JwtAuthGuard', () => {
  it('is constructible', () => {
    const guard = new JwtAuthGuard();
    expect(guard).toBeInstanceOf(JwtAuthGuard);
  });
});
