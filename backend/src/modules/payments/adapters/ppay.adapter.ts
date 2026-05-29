import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreatePaymentDto,
  PaymentGateway,
  PaymentResult,
  PayoutRequest,
  PayoutResult,
  QueryResult,
  RefundResult,
} from './payment-gateway.interface';
import { PpayTokenService } from './ppay-token.service';

/**
 * Ppay adapter — implements PaymentGateway against the Ppay MFS REST API.
 * See docs/integrations/ppay/README.md (vendor spec) for the canonical
 * request/response shapes.
 */
@Injectable()
export class PpayAdapter implements PaymentGateway {
  private readonly logger = new Logger(PpayAdapter.name);

  constructor(
    private readonly config: ConfigService,
    private readonly tokens: PpayTokenService,
  ) {}

  async createPayment(req: CreatePaymentDto): Promise<PaymentResult> {
    const data = await this.authedRequest('POST', '/checkout/initiate', {
      uniqueIdForMerchant: req.uniqueIdForMerchant,
      amount: Math.round(req.amount),
      purchaseInfo: req.purchaseInfo,
      ipnURL: req.ipnUrl,
      successURL: req.successUrl,
      failURL: req.failUrl,
      cancelURL: req.cancelUrl,
      payerReference: req.payerReference,
      remarks: req.remarks,
    });

    return {
      gatewayReference: data.paymentId,
      redirectUrl: data.redirectUrl,
      // Initiate only acknowledges; final status comes via IPN. Mark pending.
      status: 'pending',
    };
  }

  async queryPayment(gatewayReference: string): Promise<QueryResult> {
    const data = await this.authedRequest(
      'GET',
      `/manage/query?paymentId=${encodeURIComponent(gatewayReference)}`,
    );
    return {
      gatewayReference: data.paymentId,
      uniqueIdForMerchant: data.uniqueIdForMerchant,
      status: data.status,
      transactionId: data.transactionId,
      failReason: data.failReason ?? null,
    };
  }

  async refund(gatewayReference: string, ipnUrl: string, reason: string): Promise<RefundResult> {
    const data = await this.authedRequest('POST', '/manage/refund', {
      paymentId: gatewayReference,
      ipnURL: ipnUrl,
      reason,
    });
    return {
      refundId: data.refundTransactionId,
      status: data.refundStatus,
      originalTransactionId: data.originalTransactionId,
      refundReason: data.refundReason,
      refundFailReason: data.refundFailReason ?? null,
    };
  }

  async initiatePayout(req: PayoutRequest): Promise<PayoutResult> {
    const data = await this.authedRequest('POST', '/api/v1/instant-payment/initiate', {
      payerReference: req.payerReference,
      successURL: req.successUrl,
      failURL: req.failUrl,
      cancelURL: req.cancelUrl,
      bulks: req.bulks.map((b) => ({ toAccount: b.toAccount, amount: Math.round(b.amount) })),
    });
    return {
      gatewayReference: data.paymentId,
      redirectUrl: data.redirectUrl,
      statusUrl: data.statusUrl,
    };
  }

  private async authedRequest(
    method: 'GET' | 'POST',
    path: string,
    body?: Record<string, unknown>,
  ): Promise<any> {
    let attempt = 0;
    while (attempt < 2) {
      const idToken = await this.tokens.getIdToken();
      const res = await this.fetchWithTimeout(method, path, idToken, body);
      if (res.status === 401 && attempt === 0) {
        // Token may have rolled mid-flight; invalidate and retry once.
        this.tokens.invalidate();
        attempt++;
        continue;
      }
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        this.logger.error(`Ppay ${method} ${path} → ${res.status}: ${text}`);
        throw new ServiceUnavailableException('Payment gateway error');
      }
      return res.json();
    }
    throw new ServiceUnavailableException('Payment gateway auth failed');
  }

  private async fetchWithTimeout(
    method: 'GET' | 'POST',
    path: string,
    idToken: string,
    body?: Record<string, unknown>,
  ): Promise<Response> {
    const baseUrl = this.config.get<string>('ppay.baseUrl');
    const timeoutMs = this.config.get<number>('ppay.timeoutMs') ?? 30000;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(t);
    }
  }
}
