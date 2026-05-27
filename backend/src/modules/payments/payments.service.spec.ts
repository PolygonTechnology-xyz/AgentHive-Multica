import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { PaymentsService } from './payments.service';
import { Payment, PaymentStatus } from './payment.entity';
import { Job, JobStatus } from '../jobs/job.entity';
import { Bid, BidStatus } from '../bids/bid.entity';
import { PAYMENT_GATEWAY_TOKEN } from './adapters/payment-gateway.interface';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentRepo: any;
  let jobRepo: any;
  let bidRepo: any;
  let gateway: any;
  let config: any;
  let dataSource: any;
  let emitter: any;
  let txManager: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    paymentRepo = { findOne: jest.fn(), find: jest.fn() };
    jobRepo = {};
    bidRepo = {};
    gateway = {
      createPayment: jest.fn(),
      confirmPayment: jest.fn(),
      refund: jest.fn(),
    };
    config = { get: jest.fn(() => 10) };
    emitter = { emit: jest.fn() };
    txManager = {
      findOne: jest.fn(),
      update: jest.fn(),
      create: jest.fn((_e, d) => d),
      save: jest.fn((d) => Promise.resolve(d)),
    };
    dataSource = { transaction: jest.fn((cb: any) => cb(txManager)) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
        { provide: getRepositoryToken(Job), useValue: jobRepo },
        { provide: getRepositoryToken(Bid), useValue: bidRepo },
        { provide: PAYMENT_GATEWAY_TOKEN, useValue: gateway },
        { provide: ConfigService, useValue: config },
        { provide: DataSource, useValue: dataSource },
        { provide: EventEmitter2, useValue: emitter },
      ],
    }).compile();
    service = module.get<PaymentsService>(PaymentsService);
  });

  describe('fundEscrow', () => {
    it('throws NotFoundException when job missing or not dispatched', async () => {
      txManager.findOne.mockResolvedValueOnce(null);
      await expect(service.fundEscrow('b', 'j')).rejects.toThrow(NotFoundException);
    });

    it('returns existing payment when idempotency hit', async () => {
      txManager.findOne.mockResolvedValueOnce({ id: 'j', title: 'T' });
      txManager.findOne.mockResolvedValueOnce({ id: 'p-existing' });
      const result = await service.fundEscrow('b', 'j', 'key1');
      expect(result.id).toBe('p-existing');
      expect(gateway.createPayment).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when no accepted bid', async () => {
      txManager.findOne.mockResolvedValueOnce({ id: 'j', title: 'T' });
      // no idempotency key -> skip idempotency lookup
      txManager.findOne.mockResolvedValueOnce(null); // accepted bid
      await expect(service.fundEscrow('b', 'j')).rejects.toThrow(BadRequestException);
    });

    it('creates payment with HELD status and emits payment.held on gateway success', async () => {
      txManager.findOne.mockResolvedValueOnce({ id: 'j', title: 'T' });
      txManager.findOne.mockResolvedValueOnce({ id: 'b', amount: 1000, currency: 'BDT', bidderId: 'f' });
      gateway.createPayment.mockResolvedValue({ gatewayReference: 'gref', status: 'pending' });
      gateway.confirmPayment.mockResolvedValue({ transactionId: 'tx1', status: 'success' });
      const result: any = await service.fundEscrow('b', 'j');
      expect(result.status).toBe(PaymentStatus.HELD);
      expect(result.platformFee).toBe(100); // 10% of 1000
      expect(txManager.update).toHaveBeenCalledWith(Job, 'j', { status: JobStatus.IN_PROGRESS });
      expect(emitter.emit).toHaveBeenCalledWith('payment.held', expect.any(Object));
    });

    it('creates payment with PENDING status when gateway confirm fails', async () => {
      txManager.findOne.mockResolvedValueOnce({ id: 'j', title: 'T' });
      txManager.findOne.mockResolvedValueOnce({ id: 'b', amount: 500, currency: 'BDT', bidderId: 'f' });
      gateway.createPayment.mockResolvedValue({ gatewayReference: 'gref', status: 'pending' });
      gateway.confirmPayment.mockResolvedValue({ transactionId: 'tx', status: 'failed' });
      const result: any = await service.fundEscrow('b', 'j');
      expect(result.status).toBe(PaymentStatus.PENDING);
      expect(emitter.emit).not.toHaveBeenCalled();
    });

    it('uses default fee% when config missing', async () => {
      config.get.mockReturnValue(undefined);
      txManager.findOne.mockResolvedValueOnce({ id: 'j', title: 'T' });
      txManager.findOne.mockResolvedValueOnce({ id: 'b', amount: 100, currency: 'BDT', bidderId: 'f' });
      gateway.createPayment.mockResolvedValue({ gatewayReference: 'g', status: 'pending' });
      gateway.confirmPayment.mockResolvedValue({ transactionId: 't', status: 'success' });
      const result: any = await service.fundEscrow('b', 'j');
      expect(result.platformFee).toBe(10);
    });
  });

  describe('release', () => {
    it('throws NotFoundException when payment missing', async () => {
      txManager.findOne.mockResolvedValue(null);
      await expect(service.release('p', 'b')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when not buyer', async () => {
      txManager.findOne.mockResolvedValue({ id: 'p', buyerId: 'other', status: PaymentStatus.HELD });
      await expect(service.release('p', 'me')).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException on invalid transition', async () => {
      txManager.findOne.mockResolvedValue({ id: 'p', buyerId: 'me', status: PaymentStatus.PENDING });
      await expect(service.release('p', 'me')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when gateway release fails', async () => {
      txManager.findOne.mockResolvedValue({ id: 'p', buyerId: 'me', status: PaymentStatus.HELD, ppayReference: 'r' });
      gateway.confirmPayment.mockResolvedValue({ transactionId: 't', status: 'failed' });
      await expect(service.release('p', 'me')).rejects.toThrow(BadRequestException);
    });

    it('releases payment and emits event', async () => {
      const payment: any = { id: 'p', buyerId: 'me', status: PaymentStatus.HELD, jobId: 'j', ppayReference: 'r' };
      txManager.findOne.mockResolvedValue(payment);
      gateway.confirmPayment.mockResolvedValue({ transactionId: 't', status: 'success' });
      await service.release('p', 'me');
      expect(payment.status).toBe(PaymentStatus.RELEASED);
      expect(payment.releasedAt).toBeInstanceOf(Date);
      expect(emitter.emit).toHaveBeenCalledWith('payment.released', expect.any(Object));
    });
  });

  describe('refund', () => {
    it('throws NotFoundException when missing', async () => {
      txManager.findOne.mockResolvedValue(null);
      await expect(service.refund('p', 'b')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when not buyer', async () => {
      txManager.findOne.mockResolvedValue({ id: 'p', buyerId: 'other', status: PaymentStatus.HELD });
      await expect(service.refund('p', 'me')).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException when gateway refund fails', async () => {
      txManager.findOne.mockResolvedValue({ id: 'p', buyerId: 'me', status: PaymentStatus.HELD, amount: 100, ppayReference: 'r' });
      gateway.refund.mockResolvedValue({ refundId: 'rf', status: 'failed' });
      await expect(service.refund('p', 'me')).rejects.toThrow(BadRequestException);
    });

    it('refunds payment', async () => {
      const payment: any = { id: 'p', buyerId: 'me', status: PaymentStatus.HELD, amount: 100, ppayReference: 'r' };
      txManager.findOne.mockResolvedValue(payment);
      gateway.refund.mockResolvedValue({ refundId: 'rf', status: 'success' });
      await service.refund('p', 'me');
      expect(payment.status).toBe(PaymentStatus.REFUNDED);
      expect(payment.refundedAt).toBeInstanceOf(Date);
    });
  });

  describe('markDisputed', () => {
    it('throws NotFoundException when missing', async () => {
      txManager.findOne.mockResolvedValue(null);
      await expect(service.markDisputed('p')).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException on invalid transition', async () => {
      txManager.findOne.mockResolvedValue({ id: 'p', status: PaymentStatus.REFUNDED });
      await expect(service.markDisputed('p')).rejects.toThrow(BadRequestException);
    });

    it('marks as disputed', async () => {
      txManager.findOne.mockResolvedValue({ id: 'p', status: PaymentStatus.HELD });
      await service.markDisputed('p');
      expect(txManager.update).toHaveBeenCalledWith(Payment, 'p', { status: PaymentStatus.DISPUTED });
    });
  });

  describe('findByUser', () => {
    it('returns payments for buyer or freelancer', async () => {
      paymentRepo.find.mockResolvedValue([{ id: 'p1' }]);
      const result = await service.findByUser('u');
      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('returns payment', async () => {
      paymentRepo.findOne.mockResolvedValue({ id: 'p' });
      const p = await service.findById('p');
      expect(p.id).toBe('p');
    });
    it('throws NotFoundException when missing', async () => {
      paymentRepo.findOne.mockResolvedValue(null);
      await expect(service.findById('p')).rejects.toThrow(NotFoundException);
    });
  });
});
