import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindOptionsWhere } from 'typeorm';
import { Job, JobStatus } from './job.entity';
import { Bid, BidStatus } from '../bids/bid.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { FilterJobsDto } from './dto/filter-jobs.dto';
import { paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { v4 as uuidv4 } from 'uuid';

export class JobPostedEvent {
  constructor(public readonly job: Job) {}
}

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job) private jobRepo: Repository<Job>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(buyerId: string, dto: CreateJobDto): Promise<Job> {
    const job = this.jobRepo.create({
      id: uuidv4(),
      buyerId,
      title: dto.title,
      description: dto.description,
      category: dto.category,
      skillsRequired: dto.skillsRequired,
      budgetMin: dto.budgetMin,
      budgetMax: dto.budgetMax,
      deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      status: JobStatus.OPEN,
    });

    const saved = await this.jobRepo.save(job);
    this.eventEmitter.emit('job.posted', new JobPostedEvent(saved));
    return saved;
  }

  async findAll(filter: FilterJobsDto): Promise<PaginatedResult<Job>> {
    const where: FindOptionsWhere<Job> = { status: JobStatus.OPEN };

    if (filter.category) where.category = filter.category;

    const qb = this.jobRepo.createQueryBuilder('job')
      .where('job.status = :status', { status: JobStatus.OPEN });

    if (filter.search) {
      qb.andWhere('(job.title LIKE :search OR job.description LIKE :search)', {
        search: `%${filter.search}%`,
      });
    }
    if (filter.category) {
      qb.andWhere('job.category = :category', { category: filter.category });
    }
    if (filter.budgetMin !== undefined) {
      qb.andWhere('job.budget_max >= :budgetMin', { budgetMin: filter.budgetMin });
    }
    if (filter.budgetMax !== undefined) {
      qb.andWhere('job.budget_min <= :budgetMax', { budgetMax: filter.budgetMax });
    }
    if (filter.skills) {
      const skills = filter.skills.split(',').map((s) => s.trim());
      qb.andWhere('JSON_OVERLAPS(job.skills_required, :skills)', {
        skills: JSON.stringify(skills),
      });
    }

    qb.orderBy('job.created_at', 'DESC')
      .skip(filter.skip)
      .take(filter.limit);

    const [items, total] = await qb.getManyAndCount();
    return paginate(items, total, filter);
  }


  async findForFreelancer(
    freelancerId: string,
    status: string | undefined,
    page = 1,
    limit = 20,
  ): Promise<{
    items: Array<{
      id: string;
      title: string;
      status: JobStatus;
      amount: number;
      currency: string;
      deadline: Date;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const normalizedStatus = status && status !== 'all' ? status : undefined;
    const qb = this.jobRepo
      .createQueryBuilder('job')
      .innerJoin(Bid, 'bid', 'bid.job_id = job.id AND bid.bidder_id = :freelancerId', {
        freelancerId,
      })
      .where('bid.status = :bidStatus', { bidStatus: BidStatus.ACCEPTED });

    if (normalizedStatus) {
      qb.andWhere('job.status = :status', { status: normalizedStatus });
    } else {
      qb.andWhere('job.status IN (:...statuses)', {
        statuses: [
          JobStatus.DISPATCHED,
          JobStatus.IN_PROGRESS,
          JobStatus.DELIVERED,
          JobStatus.REVISION,
          JobStatus.COMPLETED,
        ],
      });
    }

    const total = await qb.getCount();
    const { entities, raw } = await qb
      .addSelect('bid.amount', 'bid_amount')
      .addSelect('bid.currency', 'bid_currency')
      .orderBy('job.updated_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getRawAndEntities();

    return {
      items: entities.map((job, index) => ({
        id: job.id,
        title: job.title,
        status: job.status,
        amount: Number(raw[index]?.bid_amount ?? 0),
        currency: String(raw[index]?.bid_currency ?? job.currency),
        deadline: job.deadline,
      })),
      total,
      page,
      limit,
    };
  }

  async findById(id: string): Promise<Job> {
    const job = await this.jobRepo.findOne({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async findByBuyer(buyerId: string): Promise<Job[]> {
    return this.jobRepo.find({
      where: { buyerId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, buyerId: string, dto: Partial<CreateJobDto>): Promise<Job> {
    const job = await this.findById(id);
    if (job.buyerId !== buyerId) throw new ForbiddenException();
    if (![JobStatus.OPEN, JobStatus.DRAFT].includes(job.status)) {
      throw new BadRequestException('Cannot update job in current status');
    }

    Object.assign(job, {
      title: dto.title ?? job.title,
      description: dto.description ?? job.description,
      category: dto.category ?? job.category,
      skillsRequired: dto.skillsRequired ?? job.skillsRequired,
      budgetMin: dto.budgetMin ?? job.budgetMin,
      budgetMax: dto.budgetMax ?? job.budgetMax,
      deadline: dto.deadline ? new Date(dto.deadline) : job.deadline,
    });

    return this.jobRepo.save(job);
  }

  async cancel(id: string, buyerId: string): Promise<Job> {
    const job = await this.findById(id);
    if (job.buyerId !== buyerId) throw new ForbiddenException();
    if (job.status === JobStatus.DISPATCHED || job.status === JobStatus.IN_PROGRESS) {
      throw new BadRequestException('Cannot cancel a job in progress');
    }

    job.status = JobStatus.CANCELLED;
    return this.jobRepo.save(job);
  }

  async updateStatus(id: string, status: JobStatus): Promise<void> {
    await this.jobRepo.update(id, { status });
  }
}
