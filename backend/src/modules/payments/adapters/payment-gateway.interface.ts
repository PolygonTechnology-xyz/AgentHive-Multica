export interface CreatePaymentDto {
  amount: number;
  currency: string;
  reference: string;
  description?: string;
  returnUrl?: string;
}

export interface PaymentResult {
  gatewayReference: string;
  redirectUrl?: string;
  status: 'pending' | 'success' | 'failed';
}

export interface ConfirmResult {
  transactionId: string;
  status: 'success' | 'failed';
}

export interface RefundResult {
  refundId: string;
  status: 'success' | 'failed';
}

export interface PaymentGateway {
  createPayment(req: CreatePaymentDto): Promise<PaymentResult>;
  confirmPayment(gatewayRef: string): Promise<ConfirmResult>;
  refund(gatewayRef: string, amount: number): Promise<RefundResult>;
}

export const PAYMENT_GATEWAY_TOKEN = 'PAYMENT_GATEWAY';
