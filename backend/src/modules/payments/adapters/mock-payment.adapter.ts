import { Injectable, Logger } from '@nestjs/common';
import {
  ConfirmResult,
  CreatePaymentDto,
  PaymentGateway,
  PaymentResult,
  RefundResult,
} from './payment-gateway.interface';
import { randomBytes } from 'crypto';

@Injectable()
export class MockPaymentAdapter implements PaymentGateway {
  private readonly logger = new Logger(MockPaymentAdapter.name);

  async createPayment(req: CreatePaymentDto): Promise<PaymentResult> {
    const ref = `mock_${randomBytes(8).toString('hex')}`;
    this.logger.log(`[MOCK] createPayment ref=${ref} amount=${req.amount} ${req.currency}`);
    return { gatewayReference: ref, status: 'success' };
  }

  async confirmPayment(gatewayRef: string): Promise<ConfirmResult> {
    this.logger.log(`[MOCK] confirmPayment ref=${gatewayRef}`);
    return { transactionId: `txn_${gatewayRef}`, status: 'success' };
  }

  async refund(gatewayRef: string, amount: number): Promise<RefundResult> {
    this.logger.log(`[MOCK] refund ref=${gatewayRef} amount=${amount}`);
    return { refundId: `refund_${gatewayRef}`, status: 'success' };
  }
}
