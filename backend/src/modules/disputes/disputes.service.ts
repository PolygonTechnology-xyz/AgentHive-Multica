import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Dispute, DisputeStatus } from './dispute.entity';
import { Job, JobStatus } from '../jobs/job.entity';
import { Payment, PaymentStatus } from '../payments/payment.entity';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto, ResolutionOutcome } from './dto/resolve-dispute.dto';
import { v4 as uuidv4 } from 'uuid';

const DISPUTABLE_STATUSES = [JobStatus.IN_PROGRESS, JobStatus.DELIVERED, JobStatus.REVISION];

@Injectable()
export class DisputesService {
  constructor(
    @InjectRepository(Dispute) private disputeRepo: Repository<Dispute>,
    @InjectRepository(Job) private jobRepo: Repository<Job>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    private dataSource: DataSource,
  ) {}

  async fileDispute(dto: CreateDisputeDto, userId: string): Promise<Dispute> {
    return this.dataSource.transaction(async (manager) => {
      const job = await manager.findOne(Job, {
        where: { id: dto.jobId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!job) throw new NotFoundException('Job not found');

      if (!DISPUTABLE_STATUSES.includes(job.status)) {
        throw new BadRequestException(`Job must be in progress, delivered, or revision state to dispute`);
      }

      const isBuyer = job.buyerId === userId;
      const payment = await manager.findOne(Payment, { where: { jobId: dto.jobId } });
      const isFreelancer = payment?.freelancerId === userId;

      if (!isBuyer && !isFreelancer) {
        throw new ForbiddenException('Only job buyer or assigned freelancer can file a dispute');
      }

      const existing = await manager.findOne(Dispute, {
        where: { jobId: dto.jobId, status: DisputeStatus.OPEN },
      });
      if (existing) throw new BadRequestException('An open dispute already exists for this job');

      await manager.update(Job, dto.jobId, { status: JobStatus.DISPUTED });

      if (payment) {
        await manager.update(Payment, payment.id, { status: PaymentStatus.DISPUTED });
      }

      const dispute = manager.create(Dispute, {
        id: uuidv4(),
        jobId: dto.jobId,
        filedById: userId,
        reason: dto.reason,
        status: DisputeStatus.OPEN,
        paymentId: payment?.id,
      });

      return manager.save(dispute);
    });
  }

  async resolve(id: string, dto: ResolveDisputeDto, adminId: string): Promise<Dispute> {
    return this.dataSource.transaction(async (manager) => {
      const dispute = await manager.findOne(Dispute, {
        where: { id, status: DisputeStatus.OPEN },
        lock: { mode: 'pessimistic_write' },
      });

      if (!dispute) throw new NotFoundException('Open dispute not found');

      if (dto.outcome === ResolutionOutcome.PARTIAL && dto.buyerRefundPercent == null) {
        throw new BadRequestException('buyerRefundPercent required for partial resolution');
      }

      const statusMap: Record<ResolutionOutcome, DisputeStatus> = {
        [ResolutionOutcome.BUYER]: DisputeStatus.RESOLVED_BUYER,
        [ResolutionOutcome.FREELANCER]: DisputeStatus.RESOLVED_FREELANCER,
        [ResolutionOutcome.PARTIAL]: DisputeStatus.RESOLVED_PARTIAL,
      };

      dispute.status = statusMap[dto.outcome];
      dispute.resolution = dto.resolution;
      dispute.resolvedById = adminId;
      dispute.buyerRefundPercent = dto.buyerRefundPercent ?? null;

      await manager.save(dispute);

      if (dispute.paymentId) {
        const payment = await manager.findOne(Payment, {
          where: { id: dispute.paymentId },
          lock: { mode: 'pessimistic_write' },
        });

        if (payment) {
          const newStatus =
            dto.outcome === ResolutionOutcome.BUYER
              ? PaymentStatus.REFUNDED
              : dto.outcome === ResolutionOutcome.PARTIAL
                ? PaymentStatus.PARTIALLY_REFUNDED
                : PaymentStatus.RELEASED;

          payment.status = newStatus;
          if (newStatus === PaymentStatus.RELEASED) payment.releasedAt = new Date();
          if (newStatus === PaymentStatus.REFUNDED) payment.refundedAt = new Date();
          await manager.save(payment);
        }
      }

      const finalJobStatus =
        dto.outcome === ResolutionOutcome.BUYER
          ? JobStatus.CANCELLED
          : JobStatus.COMPLETED;

      await manager.update(Job, dispute.jobId, { status: finalJobStatus });

      return dispute;
    });
  }

  async findByUser(userId: string): Promise<Dispute[]> {
    return this.disputeRepo
      .createQueryBuilder('d')
      .innerJoin(Job, 'j', 'j.id = d.job_id')
      .innerJoin(Payment, 'p', 'p.job_id = d.job_id')
      .where('d.filed_by_id = :userId OR j.buyer_id = :userId OR p.freelancer_id = :userId', { userId })
      .orderBy('d.created_at', 'DESC')
      .getMany();
  }

  async findAll(page = 1, limit = 20, status?: DisputeStatus): Promise<{ items: Dispute[]; total: number }> {
    const where = status ? { status } : {};
    const [items, total] = await this.disputeRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }
}
