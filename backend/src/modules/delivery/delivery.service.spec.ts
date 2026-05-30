import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DeliveryService } from './delivery.service';
import { Delivery, DeliveryStatus } from './delivery.entity';
import { DeliveryFilesService } from './delivery-files.service';
import { Dispatch, DispatchStatus } from '../dispatch/dispatch.entity';
import { Job, JobStatus } from '../jobs/job.entity';
import { Payment, PaymentStatus } from '../payments/payment.entity';
import { PaymentsService } from '../payments/payments.service';

describe('DeliveryService', () => {
  let service: DeliveryService;
  let deliveryRepo: any;
  let dispatchRepo: any;
  let jobRepo: any;
  let paymentRepo: any;
  let deliveryFilesService: any;
  let paymentsService: any;
  let emitter: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    deliveryRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((d) => d),
      save: jest.fn((d) => Promise.resolve(d)),
    };
    dispatchRepo = { findOne: jest.fn(), save: jest.fn((d) => Promise.resolve(d)) };
    jobRepo = { findOne: jest.fn(), update: jest.fn() };
    paymentRepo = { findOne: jest.fn() };
    deliveryFilesService = {
      assertFilesBelongToDispatch: jest.fn().mockResolvedValue([]),
      appendSignedUrls: jest.fn((deliveries) => Promise.resolve(deliveries.map((delivery) => ({ ...delivery, attachments: delivery.attachments ?? [] })))),
    };
    paymentsService = { release: jest.fn().mockResolvedValue({}) };
    emitter = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryService,
        { provide: getRepositoryToken(Delivery), useValue: deliveryRepo },
        { provide: getRepositoryToken(Dispatch), useValue: dispatchRepo },
        { provide: getRepositoryToken(Job), useValue: jobRepo },
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
        { provide: DeliveryFilesService, useValue: deliveryFilesService },
        { provide: PaymentsService, useValue: paymentsService },
        { provide: EventEmitter2, useValue: emitter },
      ],
    }).compile();
    service = module.get<DeliveryService>(DeliveryService);
  });

  describe('submit', () => {
    it('throws NotFoundException when dispatch missing', async () => {
      dispatchRepo.findOne.mockResolvedValue(null);
      await expect(service.submit('d', 'u', {})).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when not freelancer', async () => {
      dispatchRepo.findOne.mockResolvedValue({ freelancerId: 'other', status: DispatchStatus.IN_PROGRESS });
      await expect(service.submit('d', 'me', {})).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException when dispatch status not allowed', async () => {
      dispatchRepo.findOne.mockResolvedValue({ freelancerId: 'me', status: DispatchStatus.ASSIGNED });
      await expect(service.submit('d', 'me', {})).rejects.toThrow(BadRequestException);
    });

    it('creates delivery with revisionRound=1 when first delivery', async () => {
      dispatchRepo.findOne.mockResolvedValue({ id: 'd', jobId: 'j', freelancerId: 'me', status: DispatchStatus.IN_PROGRESS });
      jobRepo.findOne.mockResolvedValue({ id: 'j', buyerId: 'buyer' });
      deliveryRepo.findOne.mockResolvedValue(null);
      const result: any = await service.submit('d', 'me', { message: 'hi' });
      expect(result.revisionRound).toBe(1);
      expect(result.status).toBe(DeliveryStatus.SUBMITTED);
      expect(emitter.emit).toHaveBeenCalledWith('delivery.submitted', expect.any(Object));
    });

    it('increments revisionRound for subsequent deliveries', async () => {
      dispatchRepo.findOne.mockResolvedValue({ id: 'd', jobId: 'j', freelancerId: 'me', status: DispatchStatus.REVISION });
      jobRepo.findOne.mockResolvedValue({ id: 'j', buyerId: 'buyer' });
      deliveryRepo.findOne.mockResolvedValue({ revisionRound: 1 });
      const result: any = await service.submit('d', 'me', { message: 'r2' });
      expect(result.revisionRound).toBe(2);
    });
  });

  describe('requestRevision', () => {
    it('throws NotFoundException when delivery missing', async () => {
      deliveryRepo.findOne.mockResolvedValue(null);
      await expect(service.requestRevision('d', 'b', 'r')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when dispatch missing', async () => {
      deliveryRepo.findOne.mockResolvedValue({ id: 'd', dispatchId: 'dp', status: DeliveryStatus.SUBMITTED });
      dispatchRepo.findOne.mockResolvedValue(null);
      await expect(service.requestRevision('d', 'b', 'r')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when not buyer', async () => {
      deliveryRepo.findOne.mockResolvedValue({ id: 'd', dispatchId: 'dp', revisionRound: 1 });
      dispatchRepo.findOne.mockResolvedValue({ id: 'dp', jobId: 'j' });
      jobRepo.findOne.mockResolvedValue({ id: 'j', buyerId: 'other' });
      await expect(service.requestRevision('d', 'me', 'r')).rejects.toThrow(ForbiddenException);
    });

    it('sets statuses to REVISION and emits event', async () => {
      deliveryRepo.findOne.mockResolvedValue({ id: 'd', dispatchId: 'dp', revisionRound: 0, status: DeliveryStatus.SUBMITTED });
      const dispatch: any = { id: 'dp', jobId: 'j', status: DispatchStatus.DELIVERED };
      dispatchRepo.findOne.mockResolvedValue(dispatch);
      jobRepo.findOne.mockResolvedValue({ id: 'j', buyerId: 'me' });
      await service.requestRevision('d', 'me', 'fix x');
      expect(dispatch.status).toBe(DispatchStatus.REVISION);
      expect(deliveryRepo.save).toHaveBeenCalledWith(expect.objectContaining({ status: DeliveryStatus.REVISION_REQUESTED }));
      expect(jobRepo.update).toHaveBeenCalledWith('j', { status: JobStatus.REVISION });
      expect(emitter.emit).toHaveBeenCalledWith('delivery.revision-requested', expect.any(Object));
    });

    it('allows revision requests beyond prior cap', async () => {
      deliveryRepo.findOne.mockResolvedValue({ id: 'd', dispatchId: 'dp', revisionRound: 5, status: DeliveryStatus.SUBMITTED });
      dispatchRepo.findOne.mockResolvedValue({ id: 'dp', jobId: 'j', freelancerId: 'f' });
      jobRepo.findOne.mockResolvedValue({ id: 'j', buyerId: 'me' });
      await expect(service.requestRevision('d', 'me', 'valid reason')).resolves.toBeUndefined();
    });

    it('throws when delivery is already approved', async () => {
      deliveryRepo.findOne.mockResolvedValue({ id: 'd', dispatchId: 'dp', status: DeliveryStatus.APPROVED });
      await expect(service.requestRevision('d', 'me', 'valid reason')).rejects.toThrow('Delivery already approved');
    });
  });

  describe('approve', () => {
    it('throws NotFoundException when delivery missing', async () => {
      deliveryRepo.findOne.mockResolvedValue(null);
      await expect(service.approve('d', 'b')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when dispatch missing', async () => {
      deliveryRepo.findOne.mockResolvedValue({ id: 'd', dispatchId: 'dp', status: DeliveryStatus.SUBMITTED });
      dispatchRepo.findOne.mockResolvedValue(null);
      await expect(service.approve('d', 'b')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when not buyer', async () => {
      deliveryRepo.findOne.mockResolvedValue({ id: 'd', dispatchId: 'dp', status: DeliveryStatus.SUBMITTED });
      dispatchRepo.findOne.mockResolvedValue({ id: 'dp', jobId: 'j' });
      jobRepo.findOne.mockResolvedValue({ id: 'j', buyerId: 'other' });
      await expect(service.approve('d', 'me')).rejects.toThrow(ForbiddenException);
    });

    it('sets dispatch to COMPLETED and emits delivery.approved with paymentId', async () => {
      deliveryRepo.findOne.mockResolvedValue({ id: 'd', dispatchId: 'dp', status: DeliveryStatus.SUBMITTED });
      const dispatch: any = { id: 'dp', jobId: 'j', status: DispatchStatus.DELIVERED };
      dispatchRepo.findOne.mockResolvedValue(dispatch);
      jobRepo.findOne.mockResolvedValue({ id: 'j', buyerId: 'me' });
      paymentRepo.findOne.mockResolvedValue({ id: 'p1', status: PaymentStatus.HELD });
      await service.approve('d', 'me');
      expect(dispatch.status).toBe(DispatchStatus.COMPLETED);
      expect(deliveryRepo.save).toHaveBeenCalledWith(expect.objectContaining({ status: DeliveryStatus.APPROVED }));
      expect(paymentsService.release).toHaveBeenCalledWith('p1', 'me');
      expect(emitter.emit).toHaveBeenCalledWith('delivery.approved', expect.objectContaining({ paymentId: 'p1' }));
    });

    it('handles missing payment gracefully', async () => {
      deliveryRepo.findOne.mockResolvedValue({ id: 'd', dispatchId: 'dp', status: DeliveryStatus.SUBMITTED });
      dispatchRepo.findOne.mockResolvedValue({ id: 'dp', jobId: 'j', status: DispatchStatus.DELIVERED });
      jobRepo.findOne.mockResolvedValue({ id: 'j', buyerId: 'me' });
      paymentRepo.findOne.mockResolvedValue(null);
      await service.approve('d', 'me');
      expect(emitter.emit).toHaveBeenCalledWith('delivery.approved', expect.objectContaining({ paymentId: undefined }));
    });
  });

  describe('findByDispatch', () => {
    it('returns deliveries', async () => {
      deliveryRepo.find.mockResolvedValue([{ id: 'd1' }]);
      const result = await service.findByDispatch('dp');
      expect(result).toHaveLength(1);
    });
  });
});
