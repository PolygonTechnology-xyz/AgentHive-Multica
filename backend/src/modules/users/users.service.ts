import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User, UserRole, UserStatus } from './user.entity';
import { EmailVerification } from './email-verification.entity';
import { RefreshToken } from './refresh-token.entity';
import { UpdateMeDto } from './dto/update-me.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface PublicUserProfile {
  displayName: string | null;
  handle: string | null;
  bio: string | null;
  skills: string[];
  photoUrl: string | null;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(EmailVerification) private verificationRepo: Repository<EmailVerification>,
    @InjectRepository(RefreshToken) private refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findByHandle(handle: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { handle } });
  }

  async findByOAuth(provider: string, oauthId: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { oauthProvider: provider, oauthId } });
  }

  async create(data: {
    email: string;
    password?: string;
    role: UserRole;
    displayName?: string;
    bio?: string;
    oauthProvider?: string;
    oauthId?: string;
  }): Promise<User> {
    const user = this.userRepo.create({
      id: uuidv4(),
      email: data.email,
      role: data.role,
      displayName: data.displayName ?? null,
      bio: data.bio ?? null,
      oauthProvider: data.oauthProvider ?? null,
      oauthId: data.oauthId ?? null,
      status: data.oauthProvider ? UserStatus.ACTIVE : UserStatus.PENDING_VERIFY,
    });

    if (data.password) {
      user.passwordHash = await bcrypt.hash(data.password, 12);
    }

    return this.userRepo.save(user);
  }

  async activate(userId: string): Promise<void> {
    await this.userRepo.update(userId, { status: UserStatus.ACTIVE });
  }

  async updateStatus(userId: string, status: UserStatus): Promise<void> {
    await this.userRepo.update(userId, { status });
  }

  async updateMe(userId: string, dto: UpdateMeDto): Promise<User> {
    const user = await this.findByIdOrThrow(userId);

    if (dto.handle !== undefined && dto.handle !== user.handle) {
      const collision = await this.userRepo.findOne({ where: { handle: dto.handle, id: Not(userId) } });
      if (collision) throw new ConflictException('Handle already in use');
      user.handle = dto.handle;
    }

    if (dto.displayName !== undefined) user.displayName = dto.displayName;
    if (dto.bio !== undefined) user.bio = dto.bio;
    if (dto.skills !== undefined) user.skills = dto.skills.map((skill) => skill.trim()).filter(Boolean);

    return this.userRepo.save(user);
  }

  async updatePhoto(userId: string, photoUrl: string): Promise<User> {
    const user = await this.findByIdOrThrow(userId);
    user.photoUrl = photoUrl;
    return this.userRepo.save(user);
  }

  async getPublicProfileByHandle(handle: string): Promise<PublicUserProfile> {
    const user = await this.findByHandle(handle);
    if (!user) throw new NotFoundException('Profile not found');
    return this.toPublicProfile(user);
  }

  async createEmailVerification(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.verificationRepo.save(
      this.verificationRepo.create({
        id: uuidv4(),
        userId,
        token,
        expiresAt,
      }),
    );

    return token;
  }

  async consumeEmailVerification(token: string): Promise<string | null> {
    const record = await this.verificationRepo.findOne({
      where: { token },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return null;
    }

    await this.verificationRepo.update(record.id, { usedAt: new Date() });
    return record.userId;
  }

  async saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    const tokenHash = await bcrypt.hash(token, 10);
    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({
        id: uuidv4(),
        userId,
        tokenHash,
        expiresAt,
      }),
    );
  }

  async validateRefreshToken(userId: string, token: string): Promise<RefreshToken | null> {
    const tokens = await this.refreshTokenRepo.find({
      where: { userId, revokedAt: null },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    for (const rt of tokens) {
      if (rt.expiresAt < new Date()) continue;
      const matches = await bcrypt.compare(token, rt.tokenHash);
      if (matches) return rt;
    }

    return null;
  }

  async revokeRefreshToken(tokenId: string): Promise<void> {
    await this.refreshTokenRepo.update(tokenId, { revokedAt: new Date() });
  }

  async revokeAllRefreshTokens(userId: string): Promise<void> {
    await this.refreshTokenRepo.update({ userId, revokedAt: null }, { revokedAt: new Date() });
  }

  sanitize(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash: _passwordHash, ...safe } = user;
    return safe;
  }

  toPublicProfile(user: User): PublicUserProfile {
    return {
      displayName: user.displayName,
      handle: user.handle,
      bio: user.bio,
      skills: user.skills ?? [],
      photoUrl: user.photoUrl,
    };
  }

  private async findByIdOrThrow(userId: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
