import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole, UserStatus } from '../users/user.entity';

const mockUsersService = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
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
const mockConfig = { get: jest.fn((key: string) => {
  const map: Record<string, any> = {
    'jwt.accessExpiry': '15m',
    'jwt.refreshExpiry': '7d',
    'jwt.secret': 'test-secret',
  };
  return map[key];
}) };

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
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('throws ConflictException when email taken', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: '1' });
      await expect(
        service.register({ email: 'a@b.com', password: 'pass', role: UserRole.BUYER }),
      ).rejects.toThrow(ConflictException);
    });

    it('creates user and verification token', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({ id: 'uid', email: 'a@b.com' });
      mockUsersService.createEmailVerification.mockResolvedValue('token123');

      const result = await service.register({
        email: 'a@b.com',
        password: 'password',
        role: UserRole.BUYER,
      });

      expect(mockUsersService.create).toHaveBeenCalled();
      expect(mockUsersService.createEmailVerification).toHaveBeenCalledWith('uid');
      expect(result.message).toContain('Registration successful');
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException for unknown email', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      const mockRes: any = { cookie: jest.fn() };
      await expect(service.login('x@x.com', 'pass', mockRes)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException for inactive account', async () => {
      const mockRes: any = { cookie: jest.fn() };
      mockUsersService.findByEmail.mockResolvedValue({
        id: '1',
        passwordHash: '$2b$12$invalidhash',
        status: UserStatus.PENDING_VERIFY,
      });
      await expect(service.login('a@b.com', 'wrongpass', mockRes)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
