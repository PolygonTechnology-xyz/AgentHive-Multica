import { of } from 'rxjs';
import { lastValueFrom } from 'rxjs';
import { AuditLogInterceptor } from './audit-log.interceptor';

const makeCtx = (req: any) => ({
  switchToHttp: () => ({ getRequest: () => req }),
} as any);

const makeNext = (val: any = 'ok') => ({ handle: () => of(val) });

describe('AuditLogInterceptor', () => {
  it('skips read methods', async () => {
    const audit = { write: jest.fn() };
    const intc = new AuditLogInterceptor(audit as any);
    const result = await lastValueFrom(
      intc.intercept(makeCtx({ method: 'GET', url: '/api/v1/jobs/abc' }), makeNext()),
    );
    expect(result).toBe('ok');
    expect(audit.write).not.toHaveBeenCalled();
  });

  it('writes audit on POST', async () => {
    const audit = { write: jest.fn() };
    const intc = new AuditLogInterceptor(audit as any);
    await lastValueFrom(
      intc.intercept(
        makeCtx({
          method: 'POST',
          url: '/api/v1/jobs/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
          user: { id: 'u1' },
          ip: '1.2.3.4',
        }),
        makeNext(),
      ),
    );
    expect(audit.write).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'u1',
        action: 'POST_JOBS',
        resourceType: 'jobs',
        resourceId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        ipAddress: '1.2.3.4',
      }),
    );
  });

  it('includes sub-action segment when not a uuid', async () => {
    const audit = { write: jest.fn() };
    const intc = new AuditLogInterceptor(audit as any);
    await lastValueFrom(
      intc.intercept(
        makeCtx({ method: 'POST', url: '/api/v1/jobs/mine', user: {}, ip: 'x' }),
        makeNext(),
      ),
    );
    expect(audit.write).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'POST_JOBS_MINE' }),
    );
  });

  it('skips when no service injected', async () => {
    const intc = new AuditLogInterceptor();
    await expect(
      lastValueFrom(
        intc.intercept(makeCtx({ method: 'POST', url: '/api/v1/foo', user: {}, ip: 'x' }), makeNext()),
      ),
    ).resolves.toBe('ok');
  });

  it('strips query string and handles unknown resource', async () => {
    const audit = { write: jest.fn() };
    const intc = new AuditLogInterceptor(audit as any);
    await lastValueFrom(
      intc.intercept(makeCtx({ method: 'POST', url: '/?x=y', user: {}, ip: 'x' }), makeNext()),
    );
    expect(audit.write).toHaveBeenCalledWith(expect.objectContaining({ action: 'POST_UNKNOWN' }));
  });
});
