import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Optional } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from '../../modules/audit-log/audit-log.service';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function deriveAction(method: string, url: string): string {
  const cleanPath = url.replace(/\/api\/v1/, '').replace(/\?.*$/, '');
  const segments = cleanPath.split('/').filter(Boolean);
  const resource = segments[0] ?? 'unknown';
  const subAction = segments[1] && !/^[0-9a-f-]{36}$/.test(segments[1]) ? `_${segments[1]}` : '';
  return `${method}_${resource}${subAction}`.toUpperCase();
}

function extractResourceId(url: string): string | undefined {
  const match = url.match(/\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  return match?.[1];
}

function extractResourceType(url: string): string | undefined {
  const cleanPath = url.replace(/\/api\/v1/, '').replace(/\?.*$/, '');
  return cleanPath.split('/').filter(Boolean)[0];
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(@Optional() private auditLogService?: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip } = request;

    if (!WRITE_METHODS.has(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        if (!this.auditLogService) return;

        this.auditLogService.write({
          actorId: user?.id,
          action: deriveAction(method, url),
          resourceType: extractResourceType(url),
          resourceId: extractResourceId(url),
          ipAddress: ip,
        });
      }),
    );
  }
}
