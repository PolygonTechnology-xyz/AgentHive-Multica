import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { Dispatch, DispatchStatus } from './dispatch.entity';
import { Job } from '../jobs/job.entity';
import { Bid, BidStatus } from '../bids/bid.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DispatchService {
  constructor(
    @InjectRepository(Dispatch) private dispatchRepo: Repository<Dispatch>,
    @InjectRepository(Job) private jobRepo: Repository<Job>,
    @InjectRepository(Bid) private bidRepo: Repository<Bid>,
  ) {}

  @OnEvent('payment.held')
  async onPaymentHeld(event: { paymentId: string; jobId: string }) {
    const job = await this.jobRepo.findOne({ where: { id: event.jobId } });
    if (!job) return;

    const bid = await this.bidRepo.findOne({ where: { jobId: event.jobId, status: BidStatus.ACCEPTED } });
    if (!bid) return;

    const existing = await this.dispatchRepo.findOne({ where: { jobId: event.jobId } });
    if (existing) return;

    const dueAt = bid.deliveryDays
      ? new Date(Date.now() + bid.deliveryDays * 24 * 3600 * 1000)
      : undefined;

    await this.dispatchRepo.save(
      this.dispatchRepo.create({
        id: uuidv4(),
        jobId: event.jobId,
        bidId: bid.id,
        freelancerId: bid.bidderId,
        status: DispatchStatus.ASSIGNED,
        dueAt,
      }),
    );
  }

  async findByJob(jobId: string): Promise<Dispatch | null> {
    return this.dispatchRepo.findOne({ where: { jobId } });
  }

  async findActive(userId: string): Promise<Dispatch[]> {
    return this.dispatchRepo.find({
      where: { freelancerId: userId, status: DispatchStatus.IN_PROGRESS },
      order: { assignedAt: 'DESC' },
    });
  }

  async start(jobId: string, freelancerId: string): Promise<Dispatch> {
    const dispatch = await this.dispatchRepo.findOne({ where: { jobId } });
    if (!dispatch) throw new NotFoundException('Dispatch not found');
    if (dispatch.freelancerId !== freelancerId) throw new ForbiddenException();

    dispatch.status = DispatchStatus.IN_PROGRESS;
    dispatch.startedAt = new Date();
    return this.dispatchRepo.save(dispatch);
  }

  async updateStatus(jobId: string, status: DispatchStatus): Promise<void> {
    await this.dispatchRepo.update({ jobId }, { status });
  }

  async findByFreelancer(freelancerId: string): Promise<Dispatch[]> {
    return this.dispatchRepo.find({
      where: { freelancerId },
      order: { assignedAt: 'DESC' },
    });
  }
}
