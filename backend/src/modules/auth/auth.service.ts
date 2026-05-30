import {
  BadRequestException,
  ConflictException,
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { JwtBlacklistService } from './jwt-blacklist.service';

const COOKIE_OPTS = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge,
  path: '/',
});

export interface LoginResponse {
  user: Omit<User, 'passwordHash'>;
  accessToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
    private eventEmitter: EventEmitter2,
    @Optional() private blacklistService: JwtBlacklistService = new JwtBlacklistService(),
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      role: dto.role,
      displayName: dto.displayName,
    });

    this.eventEmitter.emit('user.registered', { userId: user.id, role: user.role });
    const token = await this.usersService.createEmailVerification(user.id);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Email verification token for ${user.email}: ${token}`);
    }

    return { message: 'Registration successful. Check your email to verify your account.' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const userId = await this.usersService.consumeEmailVerification(token);
    if (!userId) throw new BadRequestException('Invalid or expired verification token');

    await this.usersService.activate(userId);
    return { message: 'Email verified successfully. You can now log in.' };
  }

  async login(email: string, password: string, res: Response): Promise<LoginResponse> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account not active. Please verify your email first.');
    }

    const issued = await this.issueTokens(user, res);
    return { user: this.sanitize(user), accessToken: issued.accessToken, expiresIn: issued.expiresIn };
  }

  async loginOAuth(
    oauthUser: { oauthId: string; email: string; displayName: string; provider: string },
    defaultRole: UserRole = UserRole.FREELANCER,
    res: Response,
  ): Promise<User> {
    let user = await this.usersService.findByOAuth(oauthUser.provider, oauthUser.oauthId);

    if (!user && oauthUser.email) {
      user = await this.usersService.findByEmail(oauthUser.email);
    }

    if (!user) {
      user = await this.usersService.create({
        email: oauthUser.email,
        role: defaultRole,
        displayName: oauthUser.displayName,
        oauthProvider: oauthUser.provider,
        oauthId: oauthUser.oauthId,
      });
    }

    await this.issueTokens(user, res);
    return user;
  }

  async refresh(refreshToken: string, userId: string, res: Response): Promise<void> {
    const rt = await this.usersService.validateRefreshToken(userId, refreshToken);
    if (!rt) throw new UnauthorizedException('Invalid refresh token');

    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();

    await this.usersService.revokeRefreshToken(rt.id);
    await this.issueTokens(user, res);
  }

  async logout(
    userId: string,
    tokenMetaOrRes: { jti?: string; exp?: number } | Response,
    maybeRes?: Response,
  ): Promise<void> {
    const tokenMeta = maybeRes ? (tokenMetaOrRes as { jti?: string; exp?: number }) : {};
    const res = maybeRes ?? (tokenMetaOrRes as Response);
    await this.usersService.revokeAllRefreshTokens(userId);
    if (tokenMeta.jti && tokenMeta.exp) {
      await this.blacklistService.blacklist(tokenMeta.jti, Math.max(tokenMeta.exp - Math.floor(Date.now() / 1000), 0));
    }
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
  }

  private async issueTokens(user: User, res: Response): Promise<{ accessToken: string; expiresIn: number }> {
    const expiresIn = parseExpirySeconds(this.config.get<string>('jwt.accessExpiry') ?? '15m');
    const payload = { sub: user.id, email: user.email, role: user.role, jti: uuidv4() };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn,
    });

    const refreshToken = randomBytes(40).toString('hex');
    const refreshExpiry = this.config.get<string>('jwt.refreshExpiry');
    const refreshMs = refreshExpiry === '7d' ? 7 * 24 * 3600 * 1000 : 24 * 3600 * 1000;
    const expiresAt = new Date(Date.now() + refreshMs);

    await this.usersService.saveRefreshToken(user.id, refreshToken, expiresAt);

    res.cookie('access_token', accessToken, COOKIE_OPTS(expiresIn * 1000));
    res.cookie('refresh_token', refreshToken, COOKIE_OPTS(refreshMs));
    res.cookie('_uid', user.id, COOKIE_OPTS(refreshMs));

    return { accessToken, expiresIn };
  }

  sanitize(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash: _passwordHash, ...safe } = user;
    return safe;
  }
}

function parseExpirySeconds(value: string): number {
  const match = /^(\d+)([smhd])?$/.exec(value);
  if (!match) return 15 * 60;
  const amount = Number(match[1]);
  const unit = match[2] ?? 's';
  if (unit === 'm') return amount * 60;
  if (unit === 'h') return amount * 3600;
  if (unit === 'd') return amount * 86400;
  return amount;
}
