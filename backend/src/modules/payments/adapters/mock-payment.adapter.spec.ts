import { MockPaymentAdapter } from './mock-payment.adapter';

describe('MockPaymentAdapter', () => {
  let adapter: MockPaymentAdapter;
  beforeEach(() => { adapter = new MockPaymentAdapter(); });

  it('createPayment returns a mock reference', async () => {
    const result = await adapter.createPayment({ amount: 100, currency: 'BDT', reference: 'r' });
    expect(result.status).toBe('success');
    expect(result.gatewayReference).toMatch(/^mock_/);
  });

  it('confirmPayment returns success', async () => {
    const result = await adapter.confirmPayment('ref');
    expect(result.status).toBe('success');
    expect(result.transactionId).toContain('ref');
  });

  it('refund returns success', async () => {
    const result = await adapter.refund('ref', 50);
    expect(result.status).toBe('success');
    expect(result.refundId).toContain('ref');
  });
});
