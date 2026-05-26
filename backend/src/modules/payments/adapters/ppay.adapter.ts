import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConfirmResult,
  CreatePaymentDto,
  PaymentGateway,
  PaymentResult,
  RefundResult,
} from './payment-gateway.interface';

@Injectable()
export class PpayAdapter implements PaymentGateway {
  private readonly logger = new Logger(PpayAdapter.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(config: ConfigService) {
    this.baseUrl = config.get<string>('ppay.apiUrl');
    this.apiKey = config.get<string>('ppay.apiKey');
  }

  private async request(path: string, body: Record<string, unknown>) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`Ppay error ${res.status}: ${text}`);
      throw new ServiceUnavailableException('Payment gateway error');
    }

    return res.json();
  }

  async createPayment(req: CreatePaymentDto): Promise<PaymentResult> {
    const data = await this.request('/v1/payments', {
      amount: req.amount,
      currency: req.currency,
      reference: req.reference,
      description: req.description,
      returnUrl: req.returnUrl,
    });

    return {
      gatewayReference: data.reference,
      redirectUrl: data.redirect_url,
      status: data.status === 'INITIATED' ? 'pending' : 'failed',
    };
  }

  async confirmPayment(gatewayRef: string): Promise<ConfirmResult> {
    const data = await this.request('/v1/payments/confirm', { reference: gatewayRef });
    return {
      transactionId: data.transaction_id,
      status: data.status === 'SUCCESS' ? 'success' : 'failed',
    };
  }

  async refund(gatewayRef: string, amount: number): Promise<RefundResult> {
    const data = await this.request('/v1/refunds', { reference: gatewayRef, amount });
    return {
      refundId: data.refund_id,
      status: data.status === 'SUCCESS' ? 'success' : 'failed',
    };
  }
}
