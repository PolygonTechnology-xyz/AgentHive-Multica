import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
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
  [PaymentStatus.PENDING]: [PaymentStatus.HELD],
  [PaymentStatus.HELD]: [PaymentStatus.RELEASED, PaymentStatus.REFUNDED, PaymentStatus.DISPUTED],
  [PaymentStatus.DISPUTED]: [PaymentStatus.RELEASED, PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED],
};

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Job) private jobRepo: Repository<Job>,
    @InjectRepository(Bid) private bidRepo: Repository<Bid>,
    @Inject(PAYMENT_GATEWAY_TOKEN) private gateway: PaymentGateway,
    private config: ConfigService,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  async fundEscrow(buyerId: string, jobId: string, idempotencyKey?: string): Promise<Payment> {
    return this.dataSource.transaction(async (manager) => {
      const job = await manager.findOne(Job, {
        where: { id: jobId, buyerId, status: JobStatus.DISPATCHED },
        lock: { mode: 'pessimistic_write' },
      });

      if (!job) throw new NotFoundException('Job not found or not in dispatched state');

      if (idempotencyKey) {
        const existing = await manager.findOne(Payment, { where: { idempotencyKey } });
        if (existing) return existing;
      }

      const acceptedBid = await manager.findOne(Bid, {
        where: { jobId, status: BidStatus.ACCEPTED },
      });
      if (!acceptedBid) throw new BadRequestException('No accepted bid found');

      const feePct = this.config.get<number>('payment.feePct') ?? 10;
      const amount = Number(acceptedBid.amount);
      const platformFee = Number((amount * feePct / 100).toFixed(2));

      const gatewayResult = await this.gateway.createPayment({
        amount,
        currency: acceptedBid.currency,
        reference: `job_${jobId}`,
        description: `Escrow for job ${job.title}`,
      });

      const confirmResult = await this.gateway.confirmPayment(gatewayResult.gatewayReference);

      const payment = manager.create(Payment, {
        id: uuidv4(),
        jobId,
        buyerId,
        freelancerId: acceptedBid.bidderId,
        amount,
        platformFee,
        currency: acceptedBid.currency,
        status: confirmResult.status === 'success' ? PaymentStatus.HELD : PaymentStatus.PENDING,
        ppayReference: gatewayResult.gatewayReference,
        ppayTransactionId: confirmResult.transactionId,
        idempotencyKey: idempotencyKey ?? `auto_${jobId}`,
        heldAt: new Date(),
      });

      await manager.save(payment);

      if (payment.status === PaymentStatus.HELD) {
        await manager.update(Job, jobId, { status: JobStatus.IN_PROGRESS });
        this.eventEmitter.emit('payment.held', { paymentId: payment.id, jobId });
      }

      return payment;
    });
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

      const result = await this.gateway.confirmPayment(payment.ppayReference);
      if (result.status !== 'success') throw new BadRequestException('Gateway release failed');

      payment.status = PaymentStatus.RELEASED;
      payment.releasedAt = new Date();
      await manager.save(payment);

      await manager.update(Job, payment.jobId, { status: JobStatus.COMPLETED });
      this.eventEmitter.emit('payment.released', { paymentId: payment.id, jobId: payment.jobId });

      return payment;
    });
  }

  async refund(paymentId: string, requesterId: string): Promise<Payment> {
    return this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, {
        where: { id: paymentId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!payment) throw new NotFoundException('Payment not found');
      if (payment.buyerId !== requesterId) throw new ForbiddenException();
      this.assertTransition(payment.status, PaymentStatus.REFUNDED);

      const result = await this.gateway.refund(payment.ppayReference, Number(payment.amount));
      if (result.status !== 'success') throw new BadRequestException('Gateway refund failed');

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
