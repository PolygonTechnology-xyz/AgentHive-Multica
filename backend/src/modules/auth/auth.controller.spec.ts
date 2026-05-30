import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthErrorCode, authErrorResponse } from './auth-error-code';

describe('AuthController', () => {
  let controller: AuthController;
  let svc: any;

  beforeEach(async () => {
    svc = {
      register: jest.fn().mockResolvedValue({ message: 'ok' }),
      verifyEmail: jest.fn().mockResolvedValue({ message: 'verified' }),
      login: jest.fn().mockResolvedValue({ user: {} }),
      loginOAuth: jest.fn().mockResolvedValue({ id: 'u' }),
      refresh: jest.fn().mockResolvedValue(undefined),
      logout: jest.fn().mockResolvedValue(undefined),
      sanitize: jest.fn((u) => u),
      verifyOAuthState: jest.fn(() => 'buyer'),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: svc }],
    }).compile();
    controller = module.get<AuthController>(AuthController);
  });

  it('delegates register', async () => {
    await controller.register({ email: 'a@b.com', password: 'p', role: 'buyer' } as any);
    expect(svc.register).toHaveBeenCalled();
  });

  it('delegates verifyEmail', async () => {
    await controller.verifyEmail('tok');
    expect(svc.verifyEmail).toHaveBeenCalledWith('tok');
  });

  it('delegates login', async () => {
    const res: any = {};
    await controller.login({ email: 'a@b.com', password: 'p' } as any, res);
    expect(svc.login).toHaveBeenCalledWith('a@b.com', 'p', res);
  });

  it('refresh throws 401 when cookies are missing', async () => {
    const req: any = { cookies: {} };
    const res: any = {};
    await expect(controller.refresh(req, res)).rejects.toThrow(UnauthorizedException);
    expect(svc.refresh).not.toHaveBeenCalled();
  });

  it('refresh delegates when cookies present', async () => {
    const req: any = { cookies: { refresh_token: 'r', _uid: 'u' } };
    const res: any = {};
    const result = await controller.refresh(req, res);
    expect(svc.refresh).toHaveBeenCalledWith('r', 'u', res);
    expect((result as any).message).toBe('Tokens refreshed');
  });

  it('logout delegates', async () => {
    const res: any = {};
    await controller.logout({ id: 'u' } as any, res);
    expect(svc.logout).toHaveBeenCalledWith('u', res);
  });

  it('googleAuth is a no-op', () => {
    expect(controller.googleAuth()).toBeUndefined();
  });

  it('googleCallback redirects after OAuth', async () => {
    const req: any = {
      user: { oauthId: 'g', email: 'a@b.com', provider: 'google', displayName: 'A' },
      query: { state: 'signed-state' },
    };
    const res: any = { redirect: jest.fn() };
    await controller.googleCallback(req, res);
    expect(svc.verifyOAuthState).toHaveBeenCalledWith('signed-state');
    expect(svc.loginOAuth).toHaveBeenCalledWith(req.user, 'buyer', res);
    expect(res.redirect).toHaveBeenCalled();
  });

  it('redirects first-time OAuth users without role state to role picker', async () => {
    const req: any = {
      user: { oauthId: 'g', email: 'a@b.com', provider: 'google', displayName: 'A' },
      query: {},
    };
    const res: any = { redirect: jest.fn() };
    svc.verifyOAuthState.mockReturnValueOnce(undefined);
    svc.loginOAuth.mockRejectedValueOnce(
      new BadRequestException(
        authErrorResponse(AuthErrorCode.OAUTH_ROLE_REQUIRED, 'OAuth registration requires a role'),
      ),
    );

    await controller.googleCallback(req, res);

    expect(res.redirect).toHaveBeenCalledWith('http://localhost:3000/register?oauthRoleRequired=1');
  });

  it('me returns sanitized user', () => {
    const result = controller.me({ id: 'u', email: 'a@b.com' } as any);
    expect(svc.sanitize).toHaveBeenCalled();
    expect((result as any).id).toBe('u');
  });
});
