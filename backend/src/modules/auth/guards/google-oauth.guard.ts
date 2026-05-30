import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserRole } from '../../users/user.entity';
import { AuthService } from '../auth.service';

type GoogleAuthOptions = {
  state?: string;
};

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  constructor(private authService: AuthService) {
    super();
  }

  getAuthenticateOptions(context: ExecutionContext): GoogleAuthOptions | undefined {
    const request = context.switchToHttp().getRequest<Request>();
    const role = request.query.role;

    if (role === UserRole.BUYER || role === UserRole.FREELANCER) {
      return { state: this.authService.createOAuthState(role) };
    }

    return undefined;
  }
}
