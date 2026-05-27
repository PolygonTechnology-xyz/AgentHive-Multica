import { of, lastValueFrom } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

const ctx: any = {};

describe('TransformInterceptor', () => {
  let intc: TransformInterceptor<any>;
  beforeEach(() => { intc = new TransformInterceptor(); });

  it('wraps primitive in {data}', async () => {
    const result = await lastValueFrom(intc.intercept(ctx, { handle: () => of('hi') }));
    expect(result).toEqual({ data: 'hi' });
  });

  it('passes through object that already has data key', async () => {
    const result = await lastValueFrom(
      intc.intercept(ctx, { handle: () => of({ data: [1, 2], meta: { total: 2 } }) }),
    );
    expect(result).toEqual({ data: [1, 2], meta: { total: 2 } });
  });

  it('wraps plain object without data key', async () => {
    const result = await lastValueFrom(intc.intercept(ctx, { handle: () => of({ id: 'x' }) }));
    expect(result).toEqual({ data: { id: 'x' } });
  });

  it('wraps null', async () => {
    const result = await lastValueFrom(intc.intercept(ctx, { handle: () => of(null) }));
    expect(result).toEqual({ data: null });
  });
});
