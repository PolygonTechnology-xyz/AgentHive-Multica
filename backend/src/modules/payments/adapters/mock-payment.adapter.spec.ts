import { MockPaymentAdapter } from './mock-payment.adapter';

const baseCreate = {
  amount: 100,
  currency: 'BDT',
  uniqueIdForMerchant: 'order_1',
  purchaseInfo: 'test',
  ipnUrl: 'http://x/ipn',
  successUrl: 'http://x/s',
  failUrl: 'http://x/f',
  cancelUrl: 'http://x/c',
};

describe('MockPaymentAdapter', () => {
  let adapter: MockPaymentAdapter;
  beforeEach(() => {
    adapter = new MockPaymentAdapter();
  });

  it('createPayment returns mock reference + redirect URL + pending status', async () => {
    const result = await adapter.createPayment(baseCreate);
    expect(result.status).toBe('pending');
    expect(result.gatewayReference).toMatch(/^mock_/);
    expect(result.redirectUrl).toContain(baseCreate.successUrl);
    expect(result.redirectUrl).toContain('paymentId=');
  });

  it('queryPayment returns SUCCESSFUL with txn id', async () => {
    const result = await adapter.queryPayment('ref');
    expect(result.status).toBe('SUCCESSFUL');
    expect(result.transactionId).toContain('ref');
    expect(result.gatewayReference).toBe('ref');
  });

  it('refund returns SUCCESSFUL with refund id', async () => {
    const result = await adapter.refund('ref', 'http://x/ipn', 'because');
    expect(result.status).toBe('SUCCESSFUL');
    expect(result.refundId).toContain('ref');
    expect(result.refundReason).toBe('because');
  });

  it('initiatePayout returns a payout reference', async () => {
    const result = await adapter.initiatePayout({
      payerReference: '01700000000',
      successUrl: 'http://x/s',
      failUrl: 'http://x/f',
      cancelUrl: 'http://x/c',
      bulks: [{ toAccount: '01711111111', amount: 50 }],
    });
    expect(result.gatewayReference).toMatch(/^mockpayout_/);
  });
});
