import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { AuthErrorCode, authErrorResponse } from './auth-error-code';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user (buyer or freelancer)' })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Verify email via token from registration email' })
  @ApiQuery({ name: 'token', required: true })
  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @ApiOperation({
    summary: 'Login with email + password',
    description: 'Sets HttpOnly cookies: access_token (15min), refresh_token (7d), _uid.',
  })
  @Throttle({ default: { limit: 10, ttl: 900000 } })
  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto.email, dto.password, res);
  }

  @ApiOperation({ summary: 'Rotate access + refresh tokens using refresh cookie' })
  @ApiCookieAuth('access_token')
  @HttpCode(200)
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    const userId = req.cookies?._uid;
    if (!refreshToken || !userId) {
      throw new UnauthorizedException(
        authErrorResponse(AuthErrorCode.REFRESH_TOKEN_MISSING, 'No refresh token'),
      );
    }
    await this.authService.refresh(refreshToken, userId, res);
    return { message: 'Tokens refreshed' };
  }

  @ApiOperation({ summary: 'Logout - clears cookies and revokes refresh token' })
  @ApiBearerAuth('JWT')
  @ApiCookieAuth('access_token')
  @HttpCode(200)
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: User, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(user.id, res);
    return { message: 'Logged out' };
  }

  @ApiOperation({ summary: 'Begin Google OAuth flow (302 redirect to Google)' })
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  googleAuth() {
    // Guard initiates OAuth redirect.
  }

  @ApiOperation({ summary: 'Google OAuth callback - sets cookies and redirects to frontend' })
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const oauthUser = req.user as {
      oauthId: string;
      email: string;
      displayName: string;
      provider: string;
    };
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const role = this.authService.verifyOAuthState(req.query.state as string | undefined);

    try {
      await this.authService.loginOAuth(oauthUser, role, res);
      res.redirect(frontendUrl);
    } catch (err) {
      if (err instanceof BadRequestException) {
        const response = err.getResponse();
        const code = typeof response === 'object' && response !== null ? (response as { code?: string }).code : undefined;
        if (code === AuthErrorCode.OAUTH_ROLE_REQUIRED) {
          res.redirect(`${frontendUrl}/register?oauthRoleRequired=1`);
          return;
        }
      }
      throw err;
    }
  }

  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiBearerAuth('JWT')
  @ApiCookieAuth('access_token')
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User) {
    return this.authService.sanitize(user);
  }
}
