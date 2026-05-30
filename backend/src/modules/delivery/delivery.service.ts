import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Delivery } from './delivery.entity';
import { Dispatch, DispatchStatus } from '../dispatch/dispatch.entity';
import { Job, JobStatus } from '../jobs/job.entity';
import { Payment } from '../payments/payment.entity';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(Delivery) private deliveryRepo: Repository<Delivery>,
    @InjectRepository(Dispatch) private dispatchRepo: Repository<Dispatch>,
    @InjectRepository(Job) private jobRepo: Repository<Job>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    private config: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  async submit(
    dispatchId: string,
    submittedBy: string,
    dto: { message?: string; attachments?: { name: string; url: string }[] },
  ): Promise<Delivery> {
    const dispatch = await this.dispatchRepo.findOne({ where: { id: dispatchId } });
    if (!dispatch) throw new NotFoundException('Dispatch not found');
    if (dispatch.freelancerId !== submittedBy) throw new ForbiddenException();
    if (![DispatchStatus.IN_PROGRESS, DispatchStatus.REVISION].includes(dispatch.status)) {
      throw new BadRequestException('Cannot deliver in current dispatch status');
    }

    const lastDelivery = await this.deliveryRepo.findOne({
      where: { dispatchId },
      order: { revisionRound: 'DESC' },
    });

    const delivery = this.deliveryRepo.create({
      id: uuidv4(),
      dispatchId,
      submittedBy,
      message: dto.message,
      attachments: dto.attachments,
      revisionRound: (lastDelivery?.revisionRound ?? 0) + 1,
    });

    await this.deliveryRepo.save(delivery);

    dispatch.status = DispatchStatus.DELIVERED;
    await this.dispatchRepo.save(dispatch);
    await this.jobRepo.update(dispatch.jobId, { status: JobStatus.DELIVERED });

    this.eventEmitter.emit('delivery.submitted', { dispatchId, jobId: dispatch.jobId });

    return delivery;
  }

  async requestRevision(
    deliveryId: string,
    buyerId: string,
    reason: string,
  ): Promise<void> {
    const delivery = await this.deliveryRepo.findOne({ where: { id: deliveryId } });
    if (!delivery) throw new NotFoundException('Delivery not found');

    const dispatch = await this.dispatchRepo.findOne({ where: { id: delivery.dispatchId } });
    if (!dispatch) throw new NotFoundException('Dispatch not found');

    const job = await this.jobRepo.findOne({ where: { id: dispatch.jobId } });
    if (!job || job.buyerId !== buyerId) throw new ForbiddenException();

    const maxRevisions = this.config.get<number>('maxRevisionsDefault') ?? 2;
    if (delivery.revisionRound >= maxRevisions) {
      throw new BadRequestException(`Maximum revisions (${maxRevisions}) reached`);
    }

    dispatch.status = DispatchStatus.REVISION;
    await this.dispatchRepo.save(dispatch);
    await this.jobRepo.update(dispatch.jobId, { status: JobStatus.REVISION });

    this.eventEmitter.emit('delivery.revision-requested', {
      dispatchId: dispatch.id,
      jobId: dispatch.jobId,
      reason,
    });
  }

  async approve(deliveryId: string, buyerId: string): Promise<void> {
    const delivery = await this.deliveryRepo.findOne({ where: { id: deliveryId } });
    if (!delivery) throw new NotFoundException('Delivery not found');

    const dispatch = await this.dispatchRepo.findOne({ where: { id: delivery.dispatchId } });
    if (!dispatch) throw new NotFoundException('Dispatch not found');

    const job = await this.jobRepo.findOne({ where: { id: dispatch.jobId } });
    if (!job || job.buyerId !== buyerId) throw new ForbiddenException();

    const payment = await this.paymentRepo.findOne({ where: { jobId: dispatch.jobId } });

    dispatch.status = DispatchStatus.COMPLETED;
    await this.dispatchRepo.save(dispatch);

    this.eventEmitter.emit('delivery.approved', {
      dispatchId: dispatch.id,
      jobId: dispatch.jobId,
      paymentId: payment?.id,
    });
  }

  async findByDispatch(dispatchId: string): Promise<Delivery[]> {
    return this.deliveryRepo.find({
      where: { dispatchId },
      order: { revisionRound: 'ASC' },
    });
  }
}
