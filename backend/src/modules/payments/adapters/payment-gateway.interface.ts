export interface CreatePaymentDto {
  /** Amount in whole currency units (integer). $150.00 → 150 */
  amount: number;
  currency: string;
  /** Merchant-unique id for this payment (max 100 chars) */
  uniqueIdForMerchant: string;
  purchaseInfo: string;
  ipnUrl: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  payerReference?: string;
  remarks?: string;
}

export interface PaymentResult {
  /** Gateway-side paymentId (uuid for Ppay) */
  gatewayReference: string;
  /** URL to redirect the buyer's browser to */
  redirectUrl: string;
  /** Synchronous status returned by the initiate call */
  status: 'pending' | 'success' | 'failed';
}

export interface QueryResult {
  gatewayReference: string;
  uniqueIdForMerchant: string;
  status: 'INITIATED' | 'SUCCESSFUL' | 'FAILED' | 'CANCELLED';
  transactionId?: string;
  failReason?: string | null;
}

export interface RefundResult {
  refundId: string;
  status: 'INITIATED' | 'SUCCESSFUL' | 'FAILED' | 'CANCELLED';
  originalTransactionId?: string;
  refundReason?: string;
  refundFailReason?: string | null;
}

export interface PayoutRequest {
  /** Merchant phone (11 digits) */
  payerReference: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  /** One or more recipients */
  bulks: Array<{ toAccount: string; amount: number }>;
}

export interface PayoutResult {
  gatewayReference: string;
  redirectUrl?: string;
  statusUrl?: string;
}

export interface PaymentGateway {
  createPayment(req: CreatePaymentDto): Promise<PaymentResult>;
  queryPayment(gatewayReference: string): Promise<QueryResult>;
  refund(gatewayReference: string, ipnUrl: string, reason: string): Promise<RefundResult>;
  initiatePayout(req: PayoutRequest): Promise<PayoutResult>;
}

export const PAYMENT_GATEWAY_TOKEN = 'PAYMENT_GATEWAY';
