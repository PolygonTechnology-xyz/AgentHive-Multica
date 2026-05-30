import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class BearerOnlyJwtAuthGuard extends AuthGuard('jwt-bearer') {}
