import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Payment, PaymentStatus } from './payment.entity';
import { Job, JobStatus } from '../jobs/job.entity';
import { Bid, BidStatus } from '../bids/bid.entity';
import { PAYMENT_GATEWAY_TOKEN, PaymentGateway } from './adapters/payment-gateway.interface';
import { v4 as uuidv4 } from 'uuid';

const VALID_TRANSITIONS: Partial<Record<PaymentStatus, PaymentStatus[]>> = {
  [PaymentStatus.PENDING]: [PaymentStatus.HELD, PaymentStatus.REFUNDED],
  [PaymentStatus.HELD]: [
    PaymentStatus.RELEASED,
    PaymentStatus.REFUNDED,
    PaymentStatus.DISPUTED,
  ],
  [PaymentStatus.DISPUTED]: [
    PaymentStatus.RELEASED,
    PaymentStatus.REFUNDED,
    PaymentStatus.PARTIALLY_REFUNDED,
  ],
};

interface IpnPayload {
  paymentId: string;
  uniqueIdForMerchant: string;
  status: 'INITIATED' | 'SUCCESSFUL' | 'FAILED' | 'CANCELLED';
  transactionId?: string;
  failReason?: string | null;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Job) private jobRepo: Repository<Job>,
    @InjectRepository(Bid) private bidRepo: Repository<Bid>,
    @Inject(PAYMENT_GATEWAY_TOKEN) private gateway: PaymentGateway,
    private config: ConfigService,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Initiate escrow funding. Returns the gateway redirectUrl — the buyer's
   * browser is sent there to complete payment. We DO NOT confirm here; the
   * IPN webhook is the authoritative confirmation.
   */
  async fundEscrow(
    buyerId: string,
    jobId: string,
    idempotencyKey?: string,
  ): Promise<{ payment: Payment; redirectUrl: string }> {
    return this.dataSource.transaction(async (manager) => {
      const job = await manager.findOne(Job, {
        where: { id: jobId, buyerId, status: JobStatus.DISPATCHED },
        lock: { mode: 'pessimistic_write' },
      });
      if (!job) throw new NotFoundException('Job not found or not in dispatched state');

      if (idempotencyKey) {
        const existing = await manager.findOne(Payment, { where: { idempotencyKey } });
        if (existing) {
          return { payment: existing, redirectUrl: '' };
        }
      }

      const acceptedBid = await manager.findOne(Bid, {
        where: { jobId, status: BidStatus.ACCEPTED },
      });
      if (!acceptedBid) throw new BadRequestException('No accepted bid found');

      const feePct = this.config.get<number>('payment.feePct') ?? 10;
      const amount = Number(acceptedBid.amount);
      const platformFee = Number(((amount * feePct) / 100).toFixed(2));

      const uniqueIdForMerchant = `job_${jobId}_${Date.now()}`;
      const ipnUrl = this.config.get<string>('ppay.ipnUrl');
      const successUrl = this.config.get<string>('ppay.successUrl');
      const failUrl = this.config.get<string>('ppay.failUrl');
      const cancelUrl = this.config.get<string>('ppay.cancelUrl');

      const gw = await this.gateway.createPayment({
        amount,
        currency: acceptedBid.currency,
        uniqueIdForMerchant,
        purchaseInfo: `Escrow for job ${job.title}`.slice(0, 250),
        ipnUrl,
        successUrl,
        failUrl,
        cancelUrl,
      });

      const payment = manager.create(Payment, {
        id: uuidv4(),
        jobId,
        buyerId,
        freelancerId: acceptedBid.bidderId,
        amount,
        platformFee,
        currency: acceptedBid.currency,
        status: PaymentStatus.PENDING,
        ppayReference: gw.gatewayReference,
        idempotencyKey: idempotencyKey ?? uniqueIdForMerchant,
      });
      await manager.save(payment);
      return { payment, redirectUrl: gw.redirectUrl };
    });
  }

  /**
   * Authoritative payment-state transition driven by Ppay IPN webhook.
   * Idempotent on gatewayReference (paymentId). Always returns 200 for
   * already-processed payments per spec §4.
   */
  async handleIpn(payload: IpnPayload): Promise<{ ok: true; processed: boolean }> {
    if (!payload || !payload.paymentId) {
      throw new BadRequestException('Malformed IPN payload');
    }

    return this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, {
        where: { ppayReference: payload.paymentId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!payment) {
        // Unknown payment (e.g. Ppay test event) — ack 200 per spec.
        this.logger.warn(`IPN for unknown paymentId=${payload.paymentId}, acking`);
        return { ok: true as const, processed: false };
      }

      switch (payload.status) {
        case 'INITIATED':
          // No-op acknowledgement.
          return { ok: true as const, processed: false };

        case 'SUCCESSFUL':
          if (payment.status !== PaymentStatus.PENDING) {
            // Duplicate callback — idempotent ack.
            return { ok: true as const, processed: false };
          }
          this.assertTransition(payment.status, PaymentStatus.HELD);
          payment.status = PaymentStatus.HELD;
          payment.heldAt = new Date();
          payment.ppayTransactionId = payload.transactionId ?? null;
          await manager.save(payment);
          await manager.update(Job, payment.jobId, { status: JobStatus.IN_PROGRESS });
          const paymentConfirmedEvent = {
            paymentId: payment.id,
            jobId: payment.jobId,
          };
          this.eventEmitter.emit('payment.held', paymentConfirmedEvent);
          this.eventEmitter.emit('payment.confirmed', paymentConfirmedEvent);
          return { ok: true as const, processed: true };

        case 'FAILED':
        case 'CANCELLED':
          if (payment.status !== PaymentStatus.PENDING) {
            return { ok: true as const, processed: false };
          }
          // Leave payment in PENDING for buyer retry; do not advance state.
          this.eventEmitter.emit('payment.failed', {
            paymentId: payment.id,
            jobId: payment.jobId,
            reason: payload.failReason ?? payload.status,
          });
          return { ok: true as const, processed: true };
      }
      return { ok: true as const, processed: false };
    });
  }

  /**
   * Fallback when IPN doesn't arrive within expected window. Queries Ppay,
   * applies the same state transition logic.
   */
  async queryAndReconcile(paymentId: string): Promise<Payment> {
    const payment = await this.findById(paymentId);
    if (payment.status !== PaymentStatus.PENDING) return payment;
    const result = await this.gateway.queryPayment(payment.ppayReference);
    await this.handleIpn({
      paymentId: result.gatewayReference,
      uniqueIdForMerchant: result.uniqueIdForMerchant,
      status: result.status,
      transactionId: result.transactionId,
      failReason: result.failReason ?? null,
    });
    return this.findById(paymentId);
  }

  async release(paymentId: string, buyerId: string): Promise<Payment> {
    return this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, {
        where: { id: paymentId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!payment) throw new NotFoundException('Payment not found');
      if (payment.buyerId !== buyerId) throw new ForbiddenException();
      this.assertTransition(payment.status, PaymentStatus.RELEASED);

      payment.status = PaymentStatus.RELEASED;
      payment.releasedAt = new Date();
      await manager.save(payment);

      await manager.update(Job, payment.jobId, { status: JobStatus.COMPLETED });
      const payoutConfirmedEvent = {
        paymentId: payment.id,
        jobId: payment.jobId,
      };
      this.eventEmitter.emit('payment.released', payoutConfirmedEvent);
      this.eventEmitter.emit('payout.confirmed', payoutConfirmedEvent);

      return payment;
    });
  }

  async refund(paymentId: string, requesterId: string, reason = 'Buyer-initiated refund'): Promise<Payment> {
    return this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, {
        where: { id: paymentId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!payment) throw new NotFoundException('Payment not found');
      if (payment.buyerId !== requesterId) throw new ForbiddenException();
      this.assertTransition(payment.status, PaymentStatus.REFUNDED);

      const ipnUrl = this.config.get<string>('ppay.ipnUrl');
      const result = await this.gateway.refund(payment.ppayReference, ipnUrl, reason);
      if (result.status === 'FAILED' || result.status === 'CANCELLED') {
        throw new BadRequestException(`Gateway refund failed: ${result.refundFailReason ?? result.status}`);
      }

      payment.status = PaymentStatus.REFUNDED;
      payment.refundedAt = new Date();
      await manager.save(payment);
      return payment;
    });
  }

  async markDisputed(paymentId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, {
        where: { id: paymentId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!payment) throw new NotFoundException('Payment not found');
      this.assertTransition(payment.status, PaymentStatus.DISPUTED);
      await manager.update(Payment, paymentId, { status: PaymentStatus.DISPUTED });
    });
  }


  async findFreelancerPayouts(
    freelancerId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    items: Array<{
      id: string;
      jobId: string;
      jobTitle: string;
      grossAmount: number;
      platformFee: number;
      netAmount: number;
      status: PaymentStatus;
      createdAt: Date;
    }>;
    total: number;
    page: number;
    limit: number;
    totalEarned: number;
    totalPending: number;
  }> {
    const [payments, total] = await this.paymentRepo.findAndCount({
      where: { freelancerId },
      relations: { job: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const allPayments = await this.paymentRepo.find({ where: { freelancerId } });
    const netAmount = (payment: Payment) => Number(payment.amount) - Number(payment.platformFee);
    const totalEarned = allPayments
      .filter((payment) => payment.status === PaymentStatus.RELEASED)
      .reduce((sum, payment) => sum + netAmount(payment), 0);
    const totalPending = allPayments
      .filter((payment) => [PaymentStatus.PENDING, PaymentStatus.HELD, PaymentStatus.DISPUTED].includes(payment.status))
      .reduce((sum, payment) => sum + netAmount(payment), 0);

    return {
      items: payments.map((payment) => ({
        id: payment.id,
        jobId: payment.jobId,
        jobTitle: payment.job?.title ?? '',
        grossAmount: Number(payment.amount),
        platformFee: Number(payment.platformFee),
        netAmount: netAmount(payment),
        status: payment.status,
        createdAt: payment.createdAt,
      })),
      total,
      page,
      limit,
      totalEarned,
      totalPending,
    };
  }

  async findByUser(userId: string): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: [{ buyerId: userId }, { freelancerId: userId }],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Payment> {
    const p = await this.paymentRepo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Payment not found');
    return p;
  }

  private assertTransition(current: PaymentStatus, next: PaymentStatus) {
    const allowed = VALID_TRANSITIONS[current] ?? [];
    if (!allowed.includes(next)) {
      throw new BadRequestException(`Cannot transition payment from ${current} to ${next}`);
    }
  }
}
