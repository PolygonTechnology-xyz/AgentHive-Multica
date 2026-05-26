import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditLog');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip } = request;

    if (!WRITE_METHODS.has(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          JSON.stringify({
            actor: user?.id ?? 'anonymous',
            method,
            url,
            ip,
            ts: new Date().toISOString(),
          }),
        );
      }),
    );
  }
}
