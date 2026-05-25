import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, url, user } = req as any;
    const userId = user?.id ?? 'anonymous';
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        if (process.env.NODE_ENV === 'development') {
          console.log(`[AuditLog] ${method} ${url} user=${userId} +${ms}ms`);
        }
        // TODO: write to AuditLogModule when it exists
      }),
    );
  }
}
