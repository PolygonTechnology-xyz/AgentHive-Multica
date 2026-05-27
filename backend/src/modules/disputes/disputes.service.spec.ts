import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DisputesService } from './disputes.service';
import { Dispute, DisputeStatus } from './dispute.entity';
import { Job, JobStatus } from '../jobs/job.entity';
import { Payment, PaymentStatus } from '../payments/payment.entity';
import { ResolutionOutcome } from './dto/resolve-dispute.dto';

describe('DisputesService', () => {
  let service: DisputesService;
  let disputeRepo: any;
  let jobRepo: any;
  let paymentRepo: any;
  let dataSource: any;
  let txManager: any;
  let qb: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    qb = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: 'd1' }]),
    };
    disputeRepo = {
      createQueryBuilder: jest.fn(() => qb),
      findAndCount: jest.fn().mockResolvedValue([[{ id: 'd1' }], 1]),
    };
    jobRepo = {};
    paymentRepo = {};
    txManager = {
      findOne: jest.fn(),
      update: jest.fn(),
      create: jest.fn((_e, d) => d),
      save: jest.fn((d) => Promise.resolve(d)),
    };
    dataSource = { transaction: jest.fn((cb: any) => cb(txManager)) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputesService,
        { provide: getRepositoryToken(Dispute), useValue: disputeRepo },
        { provide: getRepositoryToken(Job), useValue: jobRepo },
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();
    service = module.get<DisputesService>(DisputesService);
  });

  describe('fileDispute', () => {
    it('throws NotFoundException when job missing', async () => {
      txManager.findOne.mockResolvedValueOnce(null);
      await expect(
        service.fileDispute({ jobId: 'j', reason: 'r' } as any, 'u'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when job not in disputable state', async () => {
      txManager.findOne.mockResolvedValueOnce({ id: 'j', status: JobStatus.OPEN, buyerId: 'b' });
      await expect(
        service.fileDispute({ jobId: 'j', reason: 'r' } as any, 'b'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ForbiddenException when not buyer/freelancer', async () => {
      txManager.findOne.mockResolvedValueOnce({ id: 'j', status: JobStatus.DELIVERED, buyerId: 'b' });
      txManager.findOne.mockResolvedValueOnce({ id: 'p', freelancerId: 'f' });
      await expect(
        service.fileDispute({ jobId: 'j', reason: 'r' } as any, 'other'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException when open dispute exists', async () => {
      txManager.findOne.mockResolvedValueOnce({ id: 'j', status: JobStatus.IN_PROGRESS, buyerId: 'b' });
      txManager.findOne.mockResolvedValueOnce({ id: 'p', freelancerId: 'f' });
      txManager.findOne.mockResolvedValueOnce({ id: 'existing' });
      await expect(
        service.fileDispute({ jobId: 'j', reason: 'r' } as any, 'b'),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates dispute and updates job + payment statuses', async () => {
      txManager.findOne.mockResolvedValueOnce({ id: 'j', status: JobStatus.IN_PROGRESS, buyerId: 'b' });
      txManager.findOne.mockResolvedValueOnce({ id: 'p', freelancerId: 'f' });
      txManager.findOne.mockResolvedValueOnce(null);
      const result: any = await service.fileDispute({ jobId: 'j', reason: 'r' } as any, 'b');
      expect(txManager.update).toHaveBeenCalledWith(Job, 'j', { status: JobStatus.DISPUTED });
      expect(txManager.update).toHaveBeenCalledWith(Payment, 'p', { status: PaymentStatus.DISPUTED });
      expect(result.filedById).toBe('b');
    });

    it('files dispute even when no payment exists', async () => {
      txManager.findOne.mockResolvedValueOnce({ id: 'j', status: JobStatus.DELIVERED, buyerId: 'b' });
      txManager.findOne.mockResolvedValueOnce(null); // no payment
      txManager.findOne.mockResolvedValueOnce(null); // no existing dispute
      const result: any = await service.fileDispute({ jobId: 'j', reason: 'r' } as any, 'b');
      expect(result.paymentId).toBeUndefined();
    });
  });

  describe('resolve', () => {
    it('throws NotFoundException when open dispute missing', async () => {
      txManager.findOne.mockResolvedValueOnce(null);
      await expect(
        service.resolve('d', { outcome: ResolutionOutcome.BUYER, resolution: 'r' } as any, 'admin'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException for partial without percent', async () => {
      txManager.findOne.mockResolvedValueOnce({ id: 'd', status: DisputeStatus.OPEN, jobId: 'j' });
      await expect(
        service.resolve('d', { outcome: ResolutionOutcome.PARTIAL, resolution: 'r' } as any, 'admin'),
      ).rejects.toThrow(BadRequestException);
    });

    it('resolves to BUYER (refund payment, cancel job)', async () => {
      const dispute: any = { id: 'd', status: DisputeStatus.OPEN, jobId: 'j', paymentId: 'p' };
      txManager.findOne.mockResolvedValueOnce(dispute);
      txManager.findOne.mockResolvedValueOnce({ id: 'p', status: PaymentStatus.DISPUTED });
      await service.resolve('d', { outcome: ResolutionOutcome.BUYER, resolution: 'r' } as any, 'admin');
      expect(dispute.status).toBe(DisputeStatus.RESOLVED_BUYER);
      expect(txManager.update).toHaveBeenCalledWith(Job, 'j', { status: JobStatus.CANCELLED });
    });

    it('resolves to FREELANCER (release payment, complete job)', async () => {
      const dispute: any = { id: 'd', status: DisputeStatus.OPEN, jobId: 'j', paymentId: 'p' };
      const payment: any = { id: 'p', status: PaymentStatus.DISPUTED };
      txManager.findOne.mockResolvedValueOnce(dispute);
      txManager.findOne.mockResolvedValueOnce(payment);
      await service.resolve('d', { outcome: ResolutionOutcome.FREELANCER, resolution: 'r' } as any, 'admin');
      expect(dispute.status).toBe(DisputeStatus.RESOLVED_FREELANCER);
      expect(payment.status).toBe(PaymentStatus.RELEASED);
      expect(payment.releasedAt).toBeInstanceOf(Date);
      expect(txManager.update).toHaveBeenCalledWith(Job, 'j', { status: JobStatus.COMPLETED });
    });

    it('resolves PARTIAL with percent', async () => {
      const dispute: any = { id: 'd', status: DisputeStatus.OPEN, jobId: 'j', paymentId: 'p' };
      const payment: any = { id: 'p', status: PaymentStatus.DISPUTED };
      txManager.findOne.mockResolvedValueOnce(dispute);
      txManager.findOne.mockResolvedValueOnce(payment);
      await service.resolve('d', { outcome: ResolutionOutcome.PARTIAL, resolution: 'r', buyerRefundPercent: 50 } as any, 'admin');
      expect(dispute.status).toBe(DisputeStatus.RESOLVED_PARTIAL);
      expect(dispute.buyerRefundPercent).toBe(50);
      expect(payment.status).toBe(PaymentStatus.PARTIALLY_REFUNDED);
    });

    it('handles dispute without paymentId', async () => {
      const dispute: any = { id: 'd', status: DisputeStatus.OPEN, jobId: 'j', paymentId: null };
      txManager.findOne.mockResolvedValueOnce(dispute);
      await service.resolve('d', { outcome: ResolutionOutcome.FREELANCER, resolution: 'r' } as any, 'admin');
      expect(txManager.findOne).toHaveBeenCalledTimes(1);
    });

    it('handles missing payment row gracefully', async () => {
      const dispute: any = { id: 'd', status: DisputeStatus.OPEN, jobId: 'j', paymentId: 'p' };
      txManager.findOne.mockResolvedValueOnce(dispute);
      txManager.findOne.mockResolvedValueOnce(null);
      await service.resolve('d', { outcome: ResolutionOutcome.BUYER, resolution: 'r' } as any, 'admin');
      expect(dispute.status).toBe(DisputeStatus.RESOLVED_BUYER);
    });

    it('sets refundedAt on BUYER outcome', async () => {
      const dispute: any = { id: 'd', status: DisputeStatus.OPEN, jobId: 'j', paymentId: 'p' };
      const payment: any = { id: 'p', status: PaymentStatus.DISPUTED };
      txManager.findOne.mockResolvedValueOnce(dispute);
      txManager.findOne.mockResolvedValueOnce(payment);
      await service.resolve('d', { outcome: ResolutionOutcome.BUYER, resolution: 'r' } as any, 'admin');
      expect(payment.refundedAt).toBeInstanceOf(Date);
    });
  });

  describe('findByUser', () => {
    it('returns disputes for user', async () => {
      const result = await service.findByUser('u');
      expect(result).toHaveLength(1);
      expect(qb.where).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns paginated disputes with no status filter', async () => {
      const result = await service.findAll();
      expect(result.total).toBe(1);
      expect(disputeRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
    });

    it('filters by status', async () => {
      await service.findAll(1, 10, DisputeStatus.OPEN);
      expect(disputeRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: DisputeStatus.OPEN } }),
      );
    });
  });
});
