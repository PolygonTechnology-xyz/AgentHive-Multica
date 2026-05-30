import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User } from '../users/user.entity';
import { Job } from '../jobs/job.entity';
import { Bid } from '../bids/bid.entity';
import { Dispatch } from '../dispatch/dispatch.entity';
import { Payment } from '../payments/payment.entity';
import { v4 as uuidv4 } from 'uuid';

export type NotificationMessage = {
  data: Notification;
};

type NotifyPayload = {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sendEmail?: boolean;
  emailTo?: string;
};

type BidLifecycleEvent = {
  bidId: string;
  jobId: string;
  buyerId: string;
  bidderId: string;
  amount?: number;
  currency?: string;
  bidType?: string;
};

type PaymentLifecycleEvent = {
  paymentId: string;
  jobId: string;
};

type DeliveryLifecycleEvent = {
  dispatchId: string;
  jobId?: string;
  paymentId?: string;
  reason?: string;
};

type NotificationSubscriber = (notification: Notification) => void;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly subscribers = new Map<string, Set<NotificationSubscriber>>();

  constructor(
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Job) private jobRepo: Repository<Job>,
    @InjectRepository(Bid) private bidRepo: Repository<Bid>,
    @InjectRepository(Dispatch) private dispatchRepo: Repository<Dispatch>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    private config: ConfigService,
  ) {}

  async notify(payload: NotifyPayload): Promise<Notification> {
    const notification = await this.notifRepo.save(
      this.notifRepo.create({
        id: uuidv4(),
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: payload.data,
      }),
    );

    this.publish(notification);

    if (payload.sendEmail && payload.emailTo) {
      await this.sendEmail(payload.emailTo, payload.title, payload.body);
    }

    return notification;
  }

  streamForUser(userId: string): Observable<NotificationMessage> {
    return new Observable<NotificationMessage>((subscriber) => {
      const emit: NotificationSubscriber = (notification) => {
        subscriber.next({ data: notification });
      };
      const existing = this.subscribers.get(userId) ?? new Set<NotificationSubscriber>();
      existing.add(emit);
      this.subscribers.set(userId, existing);

      return () => {
        existing.delete(emit);
        if (existing.size === 0) {
          this.subscribers.delete(userId);
        }
      };
    });
  }

  private publish(notification: Notification): void {
    const subscribers = this.subscribers.get(notification.userId);
    if (!subscribers) return;
    for (const subscriber of subscribers) {
      subscriber(notification);
    }
  }

  private async sendEmail(to: string, subject: string, text: string): Promise<void> {
    const apiKey = this.config.get<string>('sendgrid.apiKey');
    const from = this.config.get<string>('sendgrid.fromEmail');

    if (!apiKey || !from) {
      this.logger.warn(`[DEV] Email skipped (missing SendGrid config). To: ${to} | ${subject}`);
      return;
    }

    try {
      const sgMail = await import('@sendgrid/mail');
      sgMail.default.setApiKey(apiKey);
      await sgMail.default.send({ to, from, subject, text });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`SendGrid error: ${message}`);
    }
  }

  async findByUser(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ items: Notification[]; unreadCount: number; total: number }> {
    const [items, total] = await this.notifRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const unreadCount = await this.notifRepo.count({
      where: { userId, readAt: null },
    });

    return { items, unreadCount, total };
  }

  async markRead(id: string, userId: string): Promise<void> {
    const notif = await this.notifRepo.findOne({ where: { id, userId } });
    if (!notif) throw new NotFoundException();
    await this.notifRepo.update(id, { readAt: new Date() });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notifRepo
      .createQueryBuilder()
      .update()
      .set({ readAt: new Date() })
      .where('user_id = :userId AND read_at IS NULL', { userId })
      .execute();
  }

  @OnEvent('bid.placed')
  async onBidPlaced(event: BidLifecycleEvent): Promise<void> {
    const [buyer, bidder, job] = await Promise.all([
      this.userRepo.findOne({ where: { id: event.buyerId } }),
      this.userRepo.findOne({ where: { id: event.bidderId } }),
      this.jobRepo.findOne({ where: { id: event.jobId } }),
    ]);
    if (!buyer) return;

    await this.notify({
      userId: buyer.id,
      type: 'bid.placed',
      title: 'New bid received',
      body: `${bidder?.displayName ?? 'A freelancer'} placed a bid on ${job?.title ?? 'your job'}.`,
      data: { ...event, jobTitle: job?.title },
      sendEmail: true,
      emailTo: buyer.email,
    });
  }

  @OnEvent('bid.accepted')
  async onBidAccepted(event: BidLifecycleEvent): Promise<void> {
    const [freelancer, job] = await Promise.all([
      this.userRepo.findOne({ where: { id: event.bidderId } }),
      this.jobRepo.findOne({ where: { id: event.jobId } }),
    ]);
    if (!freelancer) return;

    await this.notify({
      userId: freelancer.id,
      type: 'bid.won',
      title: 'Your bid was accepted',
      body: `Your bid was accepted for ${job?.title ?? 'a job'}.`,
      data: { ...event, jobTitle: job?.title },
      sendEmail: true,
      emailTo: freelancer.email,
    });
  }

  @OnEvent('delivery.submitted')
  async onDeliverySubmitted(event: DeliveryLifecycleEvent): Promise<void> {
    const context = await this.getDeliveryContext(event);
    if (!context?.buyer) return;

    await this.notify({
      userId: context.buyer.id,
      type: 'job.delivered',
      title: 'Job delivered',
      body: `${context.job.title} has been delivered and is ready for review.`,
      data: { dispatchId: event.dispatchId, jobId: context.job.id },
      sendEmail: true,
      emailTo: context.buyer.email,
    });
  }

  @OnEvent('delivery.revision-requested')
  async onRevisionRequested(event: DeliveryLifecycleEvent): Promise<void> {
    const context = await this.getDeliveryContext(event);
    if (!context?.freelancer) return;

    await this.notify({
      userId: context.freelancer.id,
      type: 'revision.requested',
      title: 'Revision requested',
      body: `A revision was requested for ${context.job.title}.`,
      data: { dispatchId: event.dispatchId, jobId: context.job.id, reason: event.reason },
      sendEmail: true,
      emailTo: context.freelancer.email,
    });
  }

  @OnEvent('delivery.approved')
  async onDeliveryApproved(event: DeliveryLifecycleEvent): Promise<void> {
    const context = await this.getDeliveryContext(event);
    if (!context?.freelancer) return;

    await this.notify({
      userId: context.freelancer.id,
      type: 'delivery.approved',
      title: 'Delivery approved',
      body: `${context.job.title} was approved by the buyer.`,
      data: { dispatchId: event.dispatchId, jobId: context.job.id, paymentId: event.paymentId },
      sendEmail: true,
      emailTo: context.freelancer.email,
    });
  }

  @OnEvent('payment.confirmed')
  async onPaymentConfirmed(event: PaymentLifecycleEvent): Promise<void> {
    const context = await this.getPaymentContext(event);
    if (!context) return;

    const data = { paymentId: context.payment.id, jobId: context.job?.id, jobTitle: context.job?.title };
    await Promise.all([
      this.notify({
        userId: context.buyer.id,
        type: 'payment.confirmed',
        title: 'Payment confirmed',
        body: `Payment for ${context.job?.title ?? 'your job'} is now in escrow.`,
        data,
        sendEmail: true,
        emailTo: context.buyer.email,
      }),
      this.notify({
        userId: context.freelancer.id,
        type: 'payment.confirmed',
        title: 'Payment confirmed',
        body: `Escrow is funded for ${context.job?.title ?? 'your job'}.`,
        data,
        sendEmail: true,
        emailTo: context.freelancer.email,
      }),
    ]);
  }

  @OnEvent('payout.confirmed')
  async onPaymentReleased(event: PaymentLifecycleEvent): Promise<void> {
    const context = await this.getPaymentContext(event);
    if (!context) return;

    await this.notify({
      userId: context.freelancer.id,
      type: 'payout.confirmed',
      title: 'Payout confirmed',
      body: `Payout for ${context.job?.title ?? 'your job'} has been released.`,
      data: { paymentId: context.payment.id, jobId: context.job?.id, jobTitle: context.job?.title },
      sendEmail: true,
      emailTo: context.freelancer.email,
    });
  }

  private async getDeliveryContext(event: DeliveryLifecycleEvent): Promise<{
    dispatch: Dispatch;
    job: Job;
    buyer: User | null;
    freelancer: User | null;
  } | null> {
    const dispatch = await this.dispatchRepo.findOne({ where: { id: event.dispatchId } });
    if (!dispatch) return null;

    const job = await this.jobRepo.findOne({ where: { id: event.jobId ?? dispatch.jobId } });
    if (!job) return null;

    const [buyer, freelancer] = await Promise.all([
      this.userRepo.findOne({ where: { id: job.buyerId } }),
      this.userRepo.findOne({ where: { id: dispatch.freelancerId } }),
    ]);

    return { dispatch, job, buyer, freelancer };
  }

  private async getPaymentContext(event: PaymentLifecycleEvent): Promise<{
    payment: Payment;
    job: Job | null;
    buyer: User;
    freelancer: User;
  } | null> {
    const payment = await this.paymentRepo.findOne({ where: { id: event.paymentId } });
    if (!payment) return null;

    const [job, buyer, freelancer] = await Promise.all([
      this.jobRepo.findOne({ where: { id: event.jobId ?? payment.jobId } }),
      this.userRepo.findOne({ where: { id: payment.buyerId } }),
      this.userRepo.findOne({ where: { id: payment.freelancerId } }),
    ]);

    if (!buyer || !freelancer) return null;
    return { payment, job, buyer, freelancer };
  }
}
