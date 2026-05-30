import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { Dispatch } from '../dispatch/dispatch.entity';
import { Job } from '../jobs/job.entity';
import { User } from '../users/user.entity';
import { v4 as uuidv4 } from 'uuid';

type NotifyPayload = {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sendEmail?: boolean;
  emailTo?: string;
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Job) private jobRepo: Repository<Job>,
    @InjectRepository(Dispatch) private dispatchRepo: Repository<Dispatch>,
    private config: ConfigService,
  ) {}

  async notify(payload: NotifyPayload): Promise<void> {
    const data = { ...(payload.data ?? {}) };

    if (payload.sendEmail && payload.emailTo && !this.config.get<string>('sendgrid.apiKey')) {
      data.emailDeferred = true;
      data.emailSubject = payload.title;
      data.emailTo = payload.emailTo;
    }

    await this.notifRepo.save(
      this.notifRepo.create({
        id: uuidv4(),
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data,
      }),
    );

    if (payload.sendEmail && payload.emailTo) {
      await this.sendEmail(payload.emailTo, payload.title, payload.body);
    }
  }

  private async sendEmail(to: string, subject: string, text: string): Promise<void> {
    const apiKey = this.config.get<string>('sendgrid.apiKey');
    const from = this.config.get<string>('sendgrid.fromEmail');

    if (!apiKey) {
      this.logger.warn(`[DEV] Email skipped (no SENDGRID_API_KEY). To: ${to} | ${subject}`);
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

    const unreadCount = await this.notifRepo.count({ where: { userId, readAt: null } });

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

  @OnEvent('delivery.submitted')
  async onDeliverySubmitted(event: {
    dispatchId: string;
    deliveryId: string;
    jobId: string;
    buyerId?: string;
    revisionRound: number;
  }) {
    const job = await this.jobRepo.findOne({ where: { id: event.jobId } });
    if (!job) return;

    const buyer = await this.userRepo.findOne({ where: { id: event.buyerId ?? job.buyerId } });
    if (!buyer) return;

    await this.notify({
      userId: buyer.id,
      type: 'delivery.submitted',
      title: 'New delivery to review',
      body: `${job.title} - round ${event.revisionRound}`,
      data: { jobId: event.jobId, dispatchId: event.dispatchId, deliveryId: event.deliveryId },
      sendEmail: true,
      emailTo: buyer.email,
    });
  }

  @OnEvent('delivery.revision-requested')
  async onDeliveryRevisionRequested(event: {
    dispatchId: string;
    deliveryId: string;
    jobId: string;
    freelancerId?: string;
    reason: string;
  }) {
    const dispatch = event.freelancerId
      ? null
      : await this.dispatchRepo.findOne({ where: { id: event.dispatchId } });
    const freelancerId = event.freelancerId ?? dispatch?.freelancerId;
    if (!freelancerId) return;

    const freelancer = await this.userRepo.findOne({ where: { id: freelancerId } });
    if (!freelancer) return;

    const truncatedReason = event.reason.length > 280 ? `${event.reason.slice(0, 277)}...` : event.reason;
    await this.notify({
      userId: freelancer.id,
      type: 'delivery.revision-requested',
      title: 'Revision requested',
      body: truncatedReason,
      data: {
        jobId: event.jobId,
        dispatchId: event.dispatchId,
        deliveryId: event.deliveryId,
        reason: event.reason,
      },
      sendEmail: true,
      emailTo: freelancer.email,
    });
  }

  @OnEvent('delivery.approved')
  async onDeliveryApproved(event: { jobId: string }) {
    this.logger.log(`Delivery approved for job ${event.jobId}`);
  }

  @OnEvent('payment.released')
  async onPaymentReleased(event: { jobId: string }) {
    this.logger.log(`Payment released for job ${event.jobId}`);
  }
}
