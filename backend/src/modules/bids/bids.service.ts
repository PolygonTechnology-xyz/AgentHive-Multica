import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource, Repository } from 'typeorm';
import { Bid, BidStatus, BidType } from './bid.entity';
import { Job, JobStatus } from '../jobs/job.entity';
import { CreateBidDto } from './dto/create-bid.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid) private bidRepo: Repository<Bid>,
    @InjectRepository(Job) private jobRepo: Repository<Job>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    jobId: string,
    bidderId: string,
    dto: CreateBidDto,
    bidType: BidType = BidType.MANUAL,
    score?: number,
  ): Promise<Bid> {
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.status !== JobStatus.OPEN) throw new BadRequestException('Job is not accepting bids');
    if (job.buyerId === bidderId) throw new BadRequestException('Cannot bid on your own job');

    const existing = await this.bidRepo.findOne({ where: { jobId, bidderId } });
    if (existing) throw new ConflictException('Already bid on this job');

    const bid = this.bidRepo.create({
      id: uuidv4(),
      jobId,
      bidderId,
      bidType,
      amount: dto.amount,
      proposal: dto.proposal,
      deliveryDays: dto.deliveryDays,
      score,
    });

    const saved = await this.bidRepo.save(bid);
    this.eventEmitter.emit('bid.placed', {
      bidId: saved.id,
      jobId: job.id,
      buyerId: job.buyerId,
      bidderId: saved.bidderId,
      amount: Number(saved.amount),
      currency: saved.currency,
      bidType: saved.bidType,
    });
    return saved;
  }

  async findByJob(jobId: string, requesterId: string, requesterRole: string): Promise<Bid[]> {
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');

    if (requesterRole === 'buyer' && job.buyerId !== requesterId) {
      throw new ForbiddenException();
    }

    if (requesterRole === 'freelancer') {
      return this.bidRepo.find({ where: { jobId, bidderId: requesterId } });
    }

    return this.bidRepo.find({
      where: { jobId },
      order: { score: 'DESC', createdAt: 'ASC' },
    });
  }

  async findByBidder(bidderId: string): Promise<Bid[]> {
    return this.bidRepo.find({
      where: { bidderId },
      order: { createdAt: 'DESC' },
    });
  }

  async accept(jobId: string, bidId: string, buyerId: string): Promise<Bid> {
    return this.dataSource.transaction(async (manager) => {
      const job = await manager.findOne(Job, { where: { id: jobId }, lock: { mode: 'pessimistic_write' } });
      if (!job) throw new NotFoundException('Job not found');
      if (job.buyerId !== buyerId) throw new ForbiddenException();
      if (job.status !== JobStatus.OPEN) throw new BadRequestException('Job is not open for bid acceptance');

      const bid = await manager.findOne(Bid, { where: { id: bidId, jobId } });
      if (!bid) throw new NotFoundException('Bid not found');
      if (bid.status !== BidStatus.PENDING) throw new BadRequestException('Bid is not pending');

      await manager.update(Bid, { jobId, status: BidStatus.PENDING }, { status: BidStatus.REJECTED });
      bid.status = BidStatus.ACCEPTED;
      await manager.save(bid);

      job.status = JobStatus.DISPATCHED;
      await manager.save(job);

      this.eventEmitter.emit('bid.accepted', {
        bidId: bid.id,
        jobId: job.id,
        buyerId: job.buyerId,
        bidderId: bid.bidderId,
        amount: Number(bid.amount),
        currency: bid.currency,
        bidType: bid.bidType,
      });

      return bid;
    });
  }

  async reject(jobId: string, bidId: string, buyerId: string): Promise<Bid> {
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.buyerId !== buyerId) throw new ForbiddenException();

    const bid = await this.bidRepo.findOne({ where: { id: bidId, jobId } });
    if (!bid) throw new NotFoundException('Bid not found');
    if (bid.status !== BidStatus.PENDING) throw new BadRequestException('Bid is not pending');

    bid.status = BidStatus.REJECTED;
    return this.bidRepo.save(bid);
  }
}
