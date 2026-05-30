import { Injectable, Optional, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { JwtBlacklistService } from '../jwt-blacklist.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  jti?: string;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private config: ConfigService,
    private usersService: UsersService,
    @Optional() private blacklistService: JwtBlacklistService = new JwtBlacklistService(),
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.access_token,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    if (await this.blacklistService.isBlacklisted(payload.jti)) throw new UnauthorizedException();
    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    return Object.assign(user, { jwtId: payload.jti, jwtExp: payload.exp });
  }
}

@Injectable()
export class JwtBearerStrategy extends PassportStrategy(Strategy, 'jwt-bearer') {
  constructor(
    private config: ConfigService,
    private usersService: UsersService,
    @Optional() private blacklistService: JwtBlacklistService = new JwtBlacklistService(),
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    if (await this.blacklistService.isBlacklisted(payload.jti)) throw new UnauthorizedException();
    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    return Object.assign(user, { jwtId: payload.jti, jwtExp: payload.exp });
  }
}
