import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Delivery, DeliveryStatus } from './delivery.entity';
import { DeliveryFilesService } from './delivery-files.service';
import { Dispatch, DispatchStatus } from '../dispatch/dispatch.entity';
import { Job, JobStatus } from '../jobs/job.entity';
import { Payment, PaymentStatus } from '../payments/payment.entity';
import { PaymentsService } from '../payments/payments.service';
import { v4 as uuidv4 } from 'uuid';

export type SubmitDeliveryInput = {
  message?: string;
  fileIds?: string[];
};

export type DeliveryResponse = {
  id: string;
  jobId: string;
  dispatchId: string;
  revisionRound: number;
  status: DeliveryStatus;
  message: string | null;
  attachments: Array<Record<string, unknown>>;
  submittedBy: string;
  createdAt: string;
};

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(Delivery) private deliveryRepo: Repository<Delivery>,
    @InjectRepository(Dispatch) private dispatchRepo: Repository<Dispatch>,
    @InjectRepository(Job) private jobRepo: Repository<Job>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    private deliveryFilesService: DeliveryFilesService,
    private paymentsService: PaymentsService,
    private eventEmitter: EventEmitter2,
  ) {}

  async submit(dispatchId: string, submittedBy: string, dto: SubmitDeliveryInput): Promise<Delivery> {
    const dispatch = await this.dispatchRepo.findOne({ where: { id: dispatchId } });
    if (!dispatch) throw new NotFoundException('Dispatch not found');
    if (dispatch.freelancerId !== submittedBy) throw new ForbiddenException();
    if (![DispatchStatus.IN_PROGRESS, DispatchStatus.REVISION].includes(dispatch.status)) {
      throw new BadRequestException('Cannot deliver in current dispatch status');
    }

    const job = await this.jobRepo.findOne({ where: { id: dispatch.jobId } });
    if (!job) throw new NotFoundException('Job not found');

    const files = await this.deliveryFilesService.assertFilesBelongToDispatch(
      dispatchId,
      submittedBy,
      dto.fileIds,
    );

    const lastDelivery = await this.deliveryRepo.findOne({
      where: { dispatchId },
      order: { revisionRound: 'DESC' },
    });

    const delivery = this.deliveryRepo.create({
      id: uuidv4(),
      dispatchId,
      submittedBy,
      message: dto.message,
      attachments: files.map((file) => ({
        fileId: file.id,
        name: file.originalName,
        sizeBytes: file.sizeBytes,
        contentType: file.contentType,
      })),
      status: DeliveryStatus.SUBMITTED,
      revisionRound: (lastDelivery?.revisionRound ?? 0) + 1,
    });

    await this.deliveryRepo.save(delivery);

    dispatch.status = DispatchStatus.DELIVERED;
    await this.dispatchRepo.save(dispatch);
    await this.jobRepo.update(dispatch.jobId, { status: JobStatus.DELIVERED });

    this.eventEmitter.emit('delivery.submitted', {
      dispatchId,
      deliveryId: delivery.id,
      jobId: dispatch.jobId,
      buyerId: job.buyerId,
      revisionRound: delivery.revisionRound,
    });

    return delivery;
  }

  async requestRevision(deliveryId: string, buyerId: string, reason: string): Promise<void> {
    const delivery = await this.deliveryRepo.findOne({ where: { id: deliveryId } });
    if (!delivery) throw new NotFoundException('Delivery not found');
    this.assertNotApproved(delivery);

    const dispatch = await this.dispatchRepo.findOne({ where: { id: delivery.dispatchId } });
    if (!dispatch) throw new NotFoundException('Dispatch not found');

    const job = await this.jobRepo.findOne({ where: { id: dispatch.jobId } });
    if (!job || job.buyerId !== buyerId) throw new ForbiddenException();

    delivery.status = DeliveryStatus.REVISION_REQUESTED;
    await this.deliveryRepo.save(delivery);

    dispatch.status = DispatchStatus.REVISION;
    await this.dispatchRepo.save(dispatch);
    await this.jobRepo.update(dispatch.jobId, { status: JobStatus.REVISION });

    this.eventEmitter.emit('delivery.revision-requested', {
      dispatchId: dispatch.id,
      deliveryId: delivery.id,
      jobId: dispatch.jobId,
      freelancerId: dispatch.freelancerId,
      reason,
    });
  }

  async approve(deliveryId: string, buyerId: string): Promise<void> {
    const delivery = await this.deliveryRepo.findOne({ where: { id: deliveryId } });
    if (!delivery) throw new NotFoundException('Delivery not found');
    this.assertNotApproved(delivery);

    const dispatch = await this.dispatchRepo.findOne({ where: { id: delivery.dispatchId } });
    if (!dispatch) throw new NotFoundException('Dispatch not found');

    const job = await this.jobRepo.findOne({ where: { id: dispatch.jobId } });
    if (!job || job.buyerId !== buyerId) throw new ForbiddenException();

    const payment = await this.paymentRepo.findOne({ where: { jobId: dispatch.jobId } });

    delivery.status = DeliveryStatus.APPROVED;
    await this.deliveryRepo.save(delivery);

    dispatch.status = DispatchStatus.COMPLETED;
    await this.dispatchRepo.save(dispatch);
    await this.jobRepo.update(dispatch.jobId, { status: JobStatus.COMPLETED });

    if (payment?.status === PaymentStatus.HELD) {
      await this.paymentsService.release(payment.id, buyerId);
    }

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

  async findByJob(jobId: string, userId: string): Promise<DeliveryResponse[]> {
    const dispatch = await this.dispatchRepo.findOne({ where: { jobId } });
    if (!dispatch) throw new NotFoundException('Dispatch not found');

    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.buyerId !== userId && dispatch.freelancerId !== userId) throw new ForbiddenException();

    const deliveries = await this.deliveryRepo.find({
      where: { dispatchId: dispatch.id },
      order: { revisionRound: 'DESC' },
    });

    const responses = deliveries.map((delivery) => ({
      id: delivery.id,
      jobId,
      dispatchId: dispatch.id,
      revisionRound: delivery.revisionRound,
      status: delivery.status,
      message: delivery.message ?? null,
      attachments: delivery.attachments ?? [],
      submittedBy: delivery.submittedBy,
      createdAt: delivery.submittedAt.toISOString(),
    }));

    return this.deliveryFilesService.appendSignedUrls(responses, userId) as Promise<DeliveryResponse[]>;
  }

  private assertNotApproved(delivery: Delivery): void {
    if (delivery.status === DeliveryStatus.APPROVED) {
      throw new BadRequestException('Delivery already approved');
    }
  }
}
