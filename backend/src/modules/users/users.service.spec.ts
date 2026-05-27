import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User, UserRole, UserStatus } from './user.entity';
import { EmailVerification } from './email-verification.entity';
import { RefreshToken } from './refresh-token.entity';

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: any;
  let verificationRepo: any;
  let refreshTokenRepo: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    userRepo = {
      findOne: jest.fn(),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve(data)),
      update: jest.fn(),
    };
    verificationRepo = {
      findOne: jest.fn(),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve(data)),
      update: jest.fn(),
    };
    refreshTokenRepo = {
      find: jest.fn(),
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve(data)),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(EmailVerification), useValue: verificationRepo },
        { provide: getRepositoryToken(RefreshToken), useValue: refreshTokenRepo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findById', () => {
    it('returns user when found', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'u1' });
      const result = await service.findById('u1');
      expect(result).toEqual({ id: 'u1' });
    });
    it('returns null when not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      const result = await service.findById('missing');
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('queries by email', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
      const result = await service.findByEmail('a@b.com');
      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { email: 'a@b.com' } });
      expect(result?.email).toBe('a@b.com');
    });
  });

  describe('findByOAuth', () => {
    it('queries by provider + oauthId', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'u1' });
      await service.findByOAuth('google', 'gid');
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { oauthProvider: 'google', oauthId: 'gid' },
      });
    });
  });

  describe('create', () => {
    it('creates a password user with hashed password and PENDING_VERIFY', async () => {
      const data = { email: 'a@b.com', password: 'plainpass', role: UserRole.BUYER };
      const saved = await service.create(data);
      expect(userRepo.create).toHaveBeenCalled();
      expect(saved.passwordHash).toBeDefined();
      expect(saved.passwordHash).not.toBe('plainpass');
      expect(saved.status).toBe(UserStatus.PENDING_VERIFY);
    });

    it('creates an OAuth user with ACTIVE status and no password', async () => {
      const saved = await service.create({
        email: 'a@b.com',
        role: UserRole.FREELANCER,
        oauthProvider: 'google',
        oauthId: 'gid',
      });
      expect(saved.status).toBe(UserStatus.ACTIVE);
      expect(saved.passwordHash).toBeUndefined();
    });
  });

  describe('activate', () => {
    it('updates status to ACTIVE', async () => {
      await service.activate('u1');
      expect(userRepo.update).toHaveBeenCalledWith('u1', { status: UserStatus.ACTIVE });
    });
  });

  describe('updateStatus', () => {
    it('updates to provided status', async () => {
      await service.updateStatus('u1', UserStatus.SUSPENDED);
      expect(userRepo.update).toHaveBeenCalledWith('u1', { status: UserStatus.SUSPENDED });
    });
  });

  describe('createEmailVerification', () => {
    it('creates token and saves verification', async () => {
      const token = await service.createEmailVerification('u1');
      expect(token).toHaveLength(64);
      expect(verificationRepo.save).toHaveBeenCalled();
    });
  });

  describe('consumeEmailVerification', () => {
    it('returns null when no record', async () => {
      verificationRepo.findOne.mockResolvedValue(null);
      const result = await service.consumeEmailVerification('tok');
      expect(result).toBeNull();
    });
    it('returns null when already used', async () => {
      verificationRepo.findOne.mockResolvedValue({
        id: 'v1',
        userId: 'u1',
        usedAt: new Date(),
        expiresAt: new Date(Date.now() + 10000),
      });
      const result = await service.consumeEmailVerification('tok');
      expect(result).toBeNull();
    });
    it('returns null when expired', async () => {
      verificationRepo.findOne.mockResolvedValue({
        id: 'v1',
        userId: 'u1',
        usedAt: null,
        expiresAt: new Date(Date.now() - 10000),
      });
      const result = await service.consumeEmailVerification('tok');
      expect(result).toBeNull();
    });
    it('marks used and returns userId on valid token', async () => {
      verificationRepo.findOne.mockResolvedValue({
        id: 'v1',
        userId: 'u1',
        usedAt: null,
        expiresAt: new Date(Date.now() + 10000),
      });
      const result = await service.consumeEmailVerification('tok');
      expect(result).toBe('u1');
      expect(verificationRepo.update).toHaveBeenCalledWith('v1', expect.objectContaining({ usedAt: expect.any(Date) }));
    });
  });

  describe('saveRefreshToken', () => {
    it('hashes and saves token', async () => {
      const expires = new Date(Date.now() + 86400000);
      await service.saveRefreshToken('u1', 'token-value', expires);
      expect(refreshTokenRepo.save).toHaveBeenCalled();
      const arg = refreshTokenRepo.save.mock.calls[0][0];
      expect(arg.tokenHash).not.toBe('token-value');
    });
  });

  describe('validateRefreshToken', () => {
    it('returns null when no tokens', async () => {
      refreshTokenRepo.find.mockResolvedValue([]);
      const result = await service.validateRefreshToken('u1', 'tok');
      expect(result).toBeNull();
    });
    it('skips expired tokens', async () => {
      const hash = await bcrypt.hash('tok', 10);
      refreshTokenRepo.find.mockResolvedValue([
        { id: 't1', tokenHash: hash, expiresAt: new Date(Date.now() - 1000) },
      ]);
      const result = await service.validateRefreshToken('u1', 'tok');
      expect(result).toBeNull();
    });
    it('returns matching unexpired token', async () => {
      const hash = await bcrypt.hash('tok', 10);
      const rt = { id: 't1', tokenHash: hash, expiresAt: new Date(Date.now() + 100000) };
      refreshTokenRepo.find.mockResolvedValue([rt]);
      const result = await service.validateRefreshToken('u1', 'tok');
      expect(result).toBe(rt);
    });
    it('returns null when no token matches', async () => {
      const hash = await bcrypt.hash('other', 10);
      refreshTokenRepo.find.mockResolvedValue([
        { id: 't1', tokenHash: hash, expiresAt: new Date(Date.now() + 100000) },
      ]);
      const result = await service.validateRefreshToken('u1', 'tok');
      expect(result).toBeNull();
    });
  });

  describe('revokeRefreshToken', () => {
    it('updates revokedAt', async () => {
      await service.revokeRefreshToken('t1');
      expect(refreshTokenRepo.update).toHaveBeenCalledWith('t1', expect.objectContaining({ revokedAt: expect.any(Date) }));
    });
  });

  describe('revokeAllRefreshTokens', () => {
    it('revokes all unrevoked tokens for user', async () => {
      await service.revokeAllRefreshTokens('u1');
      expect(refreshTokenRepo.update).toHaveBeenCalledWith(
        { userId: 'u1', revokedAt: null },
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });
  });
});
