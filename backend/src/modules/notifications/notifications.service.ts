import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
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
    private config: ConfigService,
  ) {}

  async notify(payload: NotifyPayload): Promise<void> {
    await this.notifRepo.save(
      this.notifRepo.create({
        id: uuidv4(),
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        data: payload.data,
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
      this.logger.error(`SendGrid error: ${err.message}`);
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

  // Event listeners for lifecycle notifications
  @OnEvent('delivery.submitted')
  async onDeliverySubmitted(event: { jobId: string }) {
    this.logger.log(`Delivery submitted for job ${event.jobId}`);
    // TODO: look up buyer and notify — requires UsersService injection (add in full impl)
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
