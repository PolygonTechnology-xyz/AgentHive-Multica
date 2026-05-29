import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import {
  CreatePaymentDto,
  PaymentGateway,
  PaymentResult,
  PayoutRequest,
  PayoutResult,
  QueryResult,
  RefundResult,
} from './payment-gateway.interface';

@Injectable()
export class MockPaymentAdapter implements PaymentGateway {
  private readonly logger = new Logger(MockPaymentAdapter.name);

  async createPayment(req: CreatePaymentDto): Promise<PaymentResult> {
    const ref = `mock_${randomBytes(8).toString('hex')}`;
    this.logger.log(`[MOCK] createPayment ref=${ref} amount=${req.amount} ${req.currency}`);
    return {
      gatewayReference: ref,
      redirectUrl: `${req.successUrl}?mock=1&paymentId=${ref}`,
      status: 'pending',
    };
  }

  async queryPayment(gatewayReference: string): Promise<QueryResult> {
    this.logger.log(`[MOCK] queryPayment ref=${gatewayReference}`);
    return {
      gatewayReference,
      uniqueIdForMerchant: gatewayReference,
      status: 'SUCCESSFUL',
      transactionId: `txn_${gatewayReference}`,
      failReason: null,
    };
  }

  async refund(gatewayReference: string, _ipnUrl: string, reason: string): Promise<RefundResult> {
    this.logger.log(`[MOCK] refund ref=${gatewayReference} reason=${reason}`);
    return {
      refundId: `refund_${gatewayReference}`,
      status: 'SUCCESSFUL',
      originalTransactionId: `txn_${gatewayReference}`,
      refundReason: reason,
      refundFailReason: null,
    };
  }

  async initiatePayout(req: PayoutRequest): Promise<PayoutResult> {
    const ref = `mockpayout_${randomBytes(8).toString('hex')}`;
    this.logger.log(`[MOCK] initiatePayout ref=${ref} bulks=${req.bulks.length}`);
    return { gatewayReference: ref };
  }
}
