import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole, UserStatus } from '../users/user.entity';

const mockUsersService = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findByOAuth: jest.fn(),
  create: jest.fn(),
  activate: jest.fn(),
  createEmailVerification: jest.fn(),
  consumeEmailVerification: jest.fn(),
  saveRefreshToken: jest.fn(),
  validateRefreshToken: jest.fn(),
  revokeRefreshToken: jest.fn(),
  revokeAllRefreshTokens: jest.fn(),
};

const mockJwtService = { sign: jest.fn(() => 'mock-token') };
const mockConfig = {
  get: jest.fn((key: string) => {
    const map: Record<string, any> = {
      'jwt.accessExpiry': '15m',
      'jwt.refreshExpiry': '7d',
      'jwt.secret': 'test-secret',
    };
    return map[key];
  }),
};
const mockEmitter = { emit: jest.fn() };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfig },
        { provide: EventEmitter2, useValue: mockEmitter },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('throws ConflictException when email taken', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: '1' });
      await expect(
        service.register({ email: 'a@b.com', password: 'pass', role: UserRole.BUYER } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('creates user, emits event, and returns verification token', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({ id: 'uid', email: 'a@b.com', role: UserRole.BUYER });
      mockUsersService.createEmailVerification.mockResolvedValue('token123');

      const result = await service.register({
        email: 'a@b.com',
        password: 'password',
        role: UserRole.BUYER,
      } as any);

      expect(mockUsersService.create).toHaveBeenCalled();
      expect(mockEmitter.emit).toHaveBeenCalledWith('user.registered', { userId: 'uid', role: UserRole.BUYER });
      expect(mockUsersService.createEmailVerification).toHaveBeenCalledWith('uid');
      expect(result.message).toContain('Registration successful');
    });
  });

  describe('verifyEmail', () => {
    it('throws BadRequestException for invalid token', async () => {
      mockUsersService.consumeEmailVerification.mockResolvedValue(null);
      await expect(service.verifyEmail('bad')).rejects.toThrow(BadRequestException);
    });

    it('activates user and returns message on valid token', async () => {
      mockUsersService.consumeEmailVerification.mockResolvedValue('uid');
      const result = await service.verifyEmail('good');
      expect(mockUsersService.activate).toHaveBeenCalledWith('uid');
      expect(result.message).toContain('Email verified');
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException for unknown email', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      const mockRes: any = { cookie: jest.fn() };
      await expect(service.login('x@x.com', 'pass', mockRes)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for missing password hash (oauth user)', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: '1', passwordHash: null });
      const mockRes: any = { cookie: jest.fn() };
      await expect(service.login('a@b.com', 'pw', mockRes)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException on wrong password', async () => {
      const hash = await bcrypt.hash('correct', 10);
      mockUsersService.findByEmail.mockResolvedValue({ id: '1', passwordHash: hash, status: UserStatus.ACTIVE });
      const mockRes: any = { cookie: jest.fn() };
      await expect(service.login('a@b.com', 'wrong', mockRes)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when inactive', async () => {
      const hash = await bcrypt.hash('pw', 10);
      mockUsersService.findByEmail.mockResolvedValue({ id: '1', passwordHash: hash, status: UserStatus.PENDING_VERIFY });
      const mockRes: any = { cookie: jest.fn() };
      await expect(service.login('a@b.com', 'pw', mockRes)).rejects.toThrow(UnauthorizedException);
    });

    it('returns sanitized user and issues tokens on success', async () => {
      const hash = await bcrypt.hash('pw', 10);
      mockUsersService.findByEmail.mockResolvedValue({
        id: '1',
        email: 'a@b.com',
        role: UserRole.BUYER,
        passwordHash: hash,
        status: UserStatus.ACTIVE,
      });
      const mockRes: any = { cookie: jest.fn() };
      const result = await service.login('a@b.com', 'pw', mockRes);
      expect(mockRes.cookie).toHaveBeenCalled();
      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('loginOAuth', () => {
    it('uses existing OAuth user', async () => {
      mockUsersService.findByOAuth.mockResolvedValue({ id: '1', email: 'a@b.com', role: UserRole.FREELANCER });
      const mockRes: any = { cookie: jest.fn() };
      const result = await service.loginOAuth(
        { oauthId: 'g1', email: 'a@b.com', displayName: 'A', provider: 'google' },
        UserRole.FREELANCER,
        mockRes,
      );
      expect(result.id).toBe('1');
    });

    it('falls back to email lookup', async () => {
      mockUsersService.findByOAuth.mockResolvedValue(null);
      mockUsersService.findByEmail.mockResolvedValue({ id: '1', email: 'a@b.com', role: UserRole.BUYER });
      const mockRes: any = { cookie: jest.fn() };
      const result = await service.loginOAuth(
        { oauthId: 'g1', email: 'a@b.com', displayName: 'A', provider: 'google' },
        UserRole.FREELANCER,
        mockRes,
      );
      expect(result.id).toBe('1');
    });

    it('creates a new user if none found', async () => {
      mockUsersService.findByOAuth.mockResolvedValue(null);
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({ id: 'new', email: 'a@b.com', role: UserRole.FREELANCER });
      const mockRes: any = { cookie: jest.fn() };
      const result = await service.loginOAuth(
        { oauthId: 'g1', email: 'a@b.com', displayName: 'A', provider: 'google' },
        UserRole.FREELANCER,
        mockRes,
      );
      expect(mockUsersService.create).toHaveBeenCalled();
      expect(result.id).toBe('new');
    });
  });

  describe('refresh', () => {
    it('throws UnauthorizedException on invalid token', async () => {
      mockUsersService.validateRefreshToken.mockResolvedValue(null);
      const mockRes: any = { cookie: jest.fn() };
      await expect(service.refresh('rt', 'u', mockRes)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when user not found', async () => {
      mockUsersService.validateRefreshToken.mockResolvedValue({ id: 'rt1' });
      mockUsersService.findById.mockResolvedValue(null);
      const mockRes: any = { cookie: jest.fn() };
      await expect(service.refresh('rt', 'u', mockRes)).rejects.toThrow(UnauthorizedException);
    });

    it('rotates tokens on valid refresh', async () => {
      mockUsersService.validateRefreshToken.mockResolvedValue({ id: 'rt1' });
      mockUsersService.findById.mockResolvedValue({ id: 'u', email: 'a@b.com', role: UserRole.BUYER });
      const mockRes: any = { cookie: jest.fn() };
      await service.refresh('rt', 'u', mockRes);
      expect(mockUsersService.revokeRefreshToken).toHaveBeenCalledWith('rt1');
      expect(mockRes.cookie).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('revokes all tokens and clears cookies', async () => {
      const mockRes: any = { clearCookie: jest.fn() };
      await service.logout('u', mockRes);
      expect(mockUsersService.revokeAllRefreshTokens).toHaveBeenCalledWith('u');
      expect(mockRes.clearCookie).toHaveBeenCalledTimes(2);
    });
  });

  describe('sanitize', () => {
    it('strips passwordHash', () => {
      const result = service.sanitize({ id: 'u', email: 'a@b.com', passwordHash: 'secret' } as any);
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.email).toBe('a@b.com');
    });
  });
});
