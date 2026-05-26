import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../users/user.entity';
import { Job } from '../jobs/job.entity';
import { Payment } from '../payments/payment.entity';
import { Dispute, DisputeStatus } from '../disputes/dispute.entity';
import { ResolveDisputeDto } from '../disputes/dto/resolve-dispute.dto';
import { DisputesService } from '../disputes/disputes.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { BIDDER_QUEUE } from './admin.module';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Job) private jobRepo: Repository<Job>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Dispute) private disputeRepo: Repository<Dispute>,
    @InjectQueue(BIDDER_QUEUE) private bidderQueue: Queue,
    private disputesService: DisputesService,
    private auditLogService: AuditLogService,
  ) {}

  async listUsers(page = 1, limit = 20, role?: string, status?: string, search?: string) {
    const qb = this.userRepo.createQueryBuilder('u');

    if (role) qb.andWhere('u.role = :role', { role });
    if (status) qb.andWhere('u.status = :status', { status });
    if (search) qb.andWhere('u.email LIKE :search', { search: `%${search}%` });

    const [items, total] = await qb
      .orderBy('u.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total };
  }

  async setUserStatus(id: string, status: UserStatus, adminId: string): Promise<User> {
    const user = await this.userRepo.findOneOrFail({ where: { id } });
    const oldStatus = user.status;
    await this.userRepo.update(id, { status });
    await this.auditLogService.write({
      actorId: adminId,
      action: 'ADMIN_SET_USER_STATUS',
      resourceType: 'user',
      resourceId: id,
      metadata: { oldStatus, newStatus: status },
    });
    return this.userRepo.findOneOrFail({ where: { id } });
  }

  async getUserView(id: string): Promise<User> {
    return this.userRepo.findOneOrFail({ where: { id } });
  }

  async listJobs(page = 1, limit = 20, status?: string) {
    const where = status ? { status } : {};
    const [items, total] = await this.jobRepo.findAndCount({
      where: where as any,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  async listPayments(page = 1, limit = 20) {
    const [items, total] = await this.paymentRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  async getStats() {
    const [userCount, jobCount, totalRevenue, activeDisputes] = await Promise.all([
      this.userRepo.count(),
      this.jobRepo.count(),
      this.paymentRepo
        .createQueryBuilder('p')
        .select('SUM(p.platform_fee)', 'sum')
        .where("p.status IN ('released', 'partially_refunded')")
        .getRawOne()
        .then((r) => Number(r?.sum ?? 0)),
      this.disputeRepo.count({ where: { status: DisputeStatus.OPEN } }),
    ]);

    return { userCount, jobCount, totalRevenue, activeDisputes };
  }

  async listDisputes(page = 1, limit = 20, status?: DisputeStatus) {
    return this.disputesService.findAll(page, limit, status);
  }

  async resolveDispute(id: string, dto: ResolveDisputeDto, adminId: string) {
    return this.disputesService.resolve(id, dto, adminId);
  }

  async listAuditLogs(opts: {
    page?: number;
    limit?: number;
    actorId?: string;
    resourceType?: string;
    resourceId?: string;
    since?: string;
    until?: string;
  }) {
    return this.auditLogService.findAll({
      ...opts,
      since: opts.since ? new Date(opts.since) : undefined,
      until: opts.until ? new Date(opts.until) : undefined,
    });
  }

  async getQueueHealth() {
    const [waiting, active, failed, delayed, completed] = await Promise.all([
      this.bidderQueue.getWaitingCount(),
      this.bidderQueue.getActiveCount(),
      this.bidderQueue.getFailedCount(),
      this.bidderQueue.getDelayedCount(),
      this.bidderQueue.getCompletedCount(),
    ]);

    const failedJobs = failed > 0
      ? await this.bidderQueue.getFailed(0, Math.min(failed - 1, 19))
      : [];

    return {
      queue: BIDDER_QUEUE,
      counts: { waiting, active, failed, delayed, completed },
      recentFailed: failedJobs.map((j) => ({
        id: j.id,
        name: j.name,
        failedReason: j.failedReason,
        attemptsMade: j.attemptsMade,
        timestamp: j.timestamp,
      })),
    };
  }
}
