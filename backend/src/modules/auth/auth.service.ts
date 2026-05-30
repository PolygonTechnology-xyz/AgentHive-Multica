import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { User, UserRole, UserStatus } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { AuthErrorCode, authErrorResponse } from './auth-error-code';

const COOKIE_OPTS = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge,
  path: '/',
});

type OAuthStatePayload = {
  role: UserRole.BUYER | UserRole.FREELANCER;
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
    private eventEmitter: EventEmitter2,
    private notificationsService: NotificationsService,
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(
        authErrorResponse(AuthErrorCode.EMAIL_ALREADY_EXISTS, 'Email already registered'),
      );
    }

    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      role: dto.role,
      displayName: dto.displayName,
    });

    this.eventEmitter.emit('user.registered', { userId: user.id, role: user.role });
    const token = await this.usersService.createEmailVerification(user.id);
    const verifyUrl = `${this.config.get<string>('frontendUrl')}/register/${user.role}/verify?token=${token}`;
    await this.notificationsService.sendEmail(
      user.email,
      'Verify your AgentHive account',
      `Verify your AgentHive account: ${verifyUrl}`,
    );

    return { message: 'verification_email_sent' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const userId = await this.usersService.consumeEmailVerification(token);
    if (!userId) throw new BadRequestException('Invalid or expired verification token');

    await this.usersService.activate(userId);
    return { message: 'Email verified successfully. You can now log in.' };
  }

  async login(email: string, password: string, res: Response): Promise<{ user: Partial<User> }> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (user.status !== UserStatus.ACTIVE) {
      if (user.status === UserStatus.PENDING_VERIFY) {
        throw new ForbiddenException(
          authErrorResponse(
            AuthErrorCode.EMAIL_NOT_VERIFIED,
            'Account not active. Please verify your email first.',
          ),
        );
      }
      throw new ForbiddenException('Account inactive');
    }

    await this.issueTokens(user, res);
    return { user: this.sanitize(user) };
  }

  async loginOAuth(
    oauthUser: { oauthId: string; email: string; displayName: string; provider: string },
    requestedRole: UserRole.BUYER | UserRole.FREELANCER | undefined,
    res: Response,
  ): Promise<User> {
    let user = await this.usersService.findByOAuth(oauthUser.provider, oauthUser.oauthId);

    if (!user && oauthUser.email) {
      user = await this.usersService.findByEmail(oauthUser.email);
    }

    if (!user) {
      if (!requestedRole) {
        throw new BadRequestException(
          authErrorResponse(
            AuthErrorCode.OAUTH_ROLE_REQUIRED,
            'OAuth registration requires a buyer or freelancer role.',
          ),
        );
      }

      user = await this.usersService.create({
        email: oauthUser.email,
        role: requestedRole,
        displayName: oauthUser.displayName,
        oauthProvider: oauthUser.provider,
        oauthId: oauthUser.oauthId,
      });
    }

    await this.issueTokens(user, res);
    return user;
  }

  createOAuthState(role: UserRole.BUYER | UserRole.FREELANCER): string {
    return this.jwtService.sign(
      { role },
      {
        secret: this.config.get<string>('jwt.secret'),
        expiresIn: '10m',
      },
    );
  }

  verifyOAuthState(state: string | undefined): UserRole.BUYER | UserRole.FREELANCER | undefined {
    if (!state) return undefined;

    try {
      const payload = this.jwtService.verify<OAuthStatePayload>(state, {
        secret: this.config.get<string>('jwt.secret'),
      });
      if (payload.role === UserRole.BUYER || payload.role === UserRole.FREELANCER) {
        return payload.role;
      }
    } catch {
      throw new BadRequestException(
        authErrorResponse(AuthErrorCode.INVALID_OAUTH_STATE, 'Invalid OAuth state'),
      );
    }

    throw new BadRequestException(
      authErrorResponse(AuthErrorCode.INVALID_OAUTH_STATE, 'Invalid OAuth state'),
    );
  }

  async refresh(refreshToken: string, userId: string, res: Response): Promise<void> {
    const rt = await this.usersService.validateRefreshToken(userId, refreshToken);
    if (!rt) throw new UnauthorizedException('Invalid refresh token');

    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();

    await this.usersService.revokeRefreshToken(rt.id);
    await this.issueTokens(user, res);
  }

  async logout(userId: string, res: Response): Promise<void> {
    await this.usersService.revokeAllRefreshTokens(userId);
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    res.clearCookie('_uid', { path: '/' });
  }

  private async issueTokens(user: User, res: Response): Promise<void> {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.config.get<string>('jwt.accessExpiry'),
    });

    const refreshToken = randomBytes(40).toString('hex');
    const refreshExpiry = this.config.get<string>('jwt.refreshExpiry');
    const refreshMs = refreshExpiry === '7d' ? 7 * 24 * 3600 * 1000 : 24 * 3600 * 1000;
    const expiresAt = new Date(Date.now() + refreshMs);

    await this.usersService.saveRefreshToken(user.id, refreshToken, expiresAt);

    res.cookie('access_token', accessToken, COOKIE_OPTS(15 * 60 * 1000));
    res.cookie('refresh_token', refreshToken, COOKIE_OPTS(refreshMs));
    res.cookie('_uid', user.id, COOKIE_OPTS(refreshMs));
  }

  sanitize(user: User): Partial<User> {
    const { passwordHash, ...safe } = user as any;
    return safe;
  }
}
