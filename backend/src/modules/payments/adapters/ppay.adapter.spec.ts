import { ServiceUnavailableException } from '@nestjs/common';
import { PpayAdapter } from './ppay.adapter';

const makeConfig = (vals: Record<string, string>) => ({
  get: (k: string) => vals[k],
}) as any;

describe('PpayAdapter', () => {
  let adapter: PpayAdapter;
  const originalFetch = global.fetch;

  beforeEach(() => {
    adapter = new PpayAdapter(makeConfig({ 'ppay.apiUrl': 'http://x', 'ppay.apiKey': 'k' }));
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('createPayment maps INITIATED to pending', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ reference: 'rxx', redirect_url: 'http://r', status: 'INITIATED' }),
    } as any);
    const result = await adapter.createPayment({ amount: 100, currency: 'BDT', reference: 'r' });
    expect(result.status).toBe('pending');
    expect(result.gatewayReference).toBe('rxx');
  });

  it('createPayment maps other statuses to failed', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ reference: 'rxx', status: 'DECLINED' }),
    } as any);
    const result = await adapter.createPayment({ amount: 100, currency: 'BDT', reference: 'r' });
    expect(result.status).toBe('failed');
  });

  it('confirmPayment maps SUCCESS to success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ transaction_id: 'tx', status: 'SUCCESS' }),
    } as any);
    const result = await adapter.confirmPayment('ref');
    expect(result.status).toBe('success');
  });

  it('refund maps SUCCESS to success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ refund_id: 'rf', status: 'SUCCESS' }),
    } as any);
    const result = await adapter.refund('ref', 50);
    expect(result.status).toBe('success');
  });

  it('throws ServiceUnavailableException on non-OK response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue('boom'),
    } as any);
    await expect(adapter.createPayment({ amount: 1, currency: 'BDT', reference: 'r' })).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('maps failed confirm/refund statuses to failed', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ transaction_id: 't', status: 'FAILED' }),
    } as any);
    const confirm = await adapter.confirmPayment('r');
    expect(confirm.status).toBe('failed');

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ refund_id: 'r', status: 'FAILED' }),
    } as any);
    const refund = await adapter.refund('r', 1);
    expect(refund.status).toBe('failed');
  });
});
