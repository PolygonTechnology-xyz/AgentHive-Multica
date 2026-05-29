import { ServiceUnavailableException } from '@nestjs/common';
import { PpayAdapter } from './ppay.adapter';
import { PpayTokenService } from './ppay-token.service';
import type { CreatePaymentDto } from './payment-gateway.interface';

const makeConfig = (vals: Record<string, any>) =>
  ({
    get: (k: string) => vals[k],
  }) as any;

const makeTokens = (): jest.Mocked<PpayTokenService> =>
  ({
    getIdToken: jest.fn().mockResolvedValue('TOKEN'),
    invalidate: jest.fn(),
  }) as any;

const baseCreate: CreatePaymentDto = {
  amount: 150,
  currency: 'BDT',
  uniqueIdForMerchant: 'order_1',
  purchaseInfo: 'job escrow',
  ipnUrl: 'http://x/ipn',
  successUrl: 'http://x/s',
  failUrl: 'http://x/f',
  cancelUrl: 'http://x/c',
};

describe('PpayAdapter', () => {
  let adapter: PpayAdapter;
  let tokens: jest.Mocked<PpayTokenService>;
  let fetchMock: jest.Mock;
  const cfg = {
    'ppay.baseUrl': 'https://ppay.test/api',
    'ppay.timeoutMs': 30000,
  };

  beforeEach(() => {
    fetchMock = jest.fn();
    (global as any).fetch = fetchMock;
    tokens = makeTokens();
    adapter = new PpayAdapter(makeConfig(cfg), tokens);
  });

  afterEach(() => jest.clearAllMocks());

  it('createPayment posts to /checkout/initiate and returns pending', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ paymentId: 'PID', redirectUrl: 'http://gateway/page' }),
    });
    const result = await adapter.createPayment(baseCreate);
    expect(result.status).toBe('pending');
    expect(result.gatewayReference).toBe('PID');
    expect(result.redirectUrl).toBe('http://gateway/page');
    expect(fetchMock.mock.calls[0][0]).toBe('https://ppay.test/api/checkout/initiate');
    const init = fetchMock.mock.calls[0][1];
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer TOKEN');
    const body = JSON.parse(init.body);
    expect(body.amount).toBe(150);
    expect(body.ipnURL).toBe(baseCreate.ipnUrl);
    expect(body.successURL).toBe(baseCreate.successUrl);
  });

  it('rounds non-integer amounts to whole units', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ paymentId: 'P', redirectUrl: 'r' }),
    });
    await adapter.createPayment({ ...baseCreate, amount: 150.7 });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.amount).toBe(151);
  });

  it('queryPayment GETs /manage/query and maps fields', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        paymentId: 'PID',
        uniqueIdForMerchant: 'order_1',
        status: 'SUCCESSFUL',
        transactionId: 'TXN1',
        failReason: null,
      }),
    });
    const result = await adapter.queryPayment('PID');
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://ppay.test/api/manage/query?paymentId=PID',
    );
    expect(result.status).toBe('SUCCESSFUL');
    expect(result.transactionId).toBe('TXN1');
  });

  it('refund posts to /manage/refund and maps result', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        refundStatus: 'INITIATED',
        refundTransactionId: 'RFND1',
        originalTransactionId: 'TXN1',
        refundReason: 'b',
      }),
    });
    const result = await adapter.refund('PID', 'http://x/ipn', 'b');
    expect(result.status).toBe('INITIATED');
    expect(result.refundId).toBe('RFND1');
    expect(fetchMock.mock.calls[0][0]).toBe('https://ppay.test/api/manage/refund');
  });

  it('initiatePayout posts bulks and returns paymentId', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ paymentId: 'PAY1', redirectUrl: 'http://auth', statusUrl: 'http://st' }),
    });
    const result = await adapter.initiatePayout({
      payerReference: '01711111111',
      successUrl: 'http://x/s',
      failUrl: 'http://x/f',
      cancelUrl: 'http://x/c',
      bulks: [{ toAccount: '01700000001', amount: 50.4 }],
    });
    expect(result.gatewayReference).toBe('PAY1');
    expect(result.redirectUrl).toBe('http://auth');
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.bulks[0].amount).toBe(50);
  });

  it('throws ServiceUnavailableException on non-OK after retry', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'boom',
      json: async () => ({}),
    });
    await expect(adapter.createPayment(baseCreate)).rejects.toThrow(ServiceUnavailableException);
  });

  it('on 401 invalidates token and retries once', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 401, text: async () => '', json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ paymentId: 'P', redirectUrl: 'r' }) });
    const result = await adapter.createPayment(baseCreate);
    expect(result.gatewayReference).toBe('P');
    expect(tokens.invalidate).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
