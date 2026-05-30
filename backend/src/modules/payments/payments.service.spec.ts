import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';
import { PaymentsService } from './payments.service';
import { Payment, PaymentStatus } from './payment.entity';
import { Job, JobStatus } from '../jobs/job.entity';
import { Bid } from '../bids/bid.entity';
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
    paymentRepo = { findOne: jest.fn(), find: jest.fn(), findAndCount: jest.fn() };
    jobRepo = {};
    bidRepo = {};
    gateway = {
      createPayment: jest.fn(),
      queryPayment: jest.fn(),
      refund: jest.fn(),
      initiatePayout: jest.fn(),
    };
    config = {
      get: jest.fn((k: string) => {
        const map: Record<string, any> = {
          'payment.feePct': 10,
          'ppay.ipnUrl': 'http://x/ipn',
          'ppay.successUrl': 'http://x/s',
          'ppay.failUrl': 'http://x/f',
          'ppay.cancelUrl': 'http://x/c',
        };
        return map[k];
      }),
    };
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
      expect(result.payment.id).toBe('p-existing');
      expect(gateway.createPayment).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when no accepted bid', async () => {
      txManager.findOne.mockResolvedValueOnce({ id: 'j', title: 'T' });
      txManager.findOne.mockResolvedValueOnce(null);
      await expect(service.fundEscrow('b', 'j')).rejects.toThrow(BadRequestException);
    });

    it('creates PENDING payment + returns redirectUrl from gateway', async () => {
      txManager.findOne.mockResolvedValueOnce({ id: 'j', title: 'T' });
      txManager.findOne.mockResolvedValueOnce({
        id: 'b',
        amount: 1000,
        currency: 'BDT',
        bidderId: 'f',
      });
      gateway.createPayment.mockResolvedValue({
        gatewayReference: 'PID',
        redirectUrl: 'http://gateway/page',
        status: 'pending',
      });
      const result = await service.fundEscrow('b', 'j');
      expect(result.payment.status).toBe(PaymentStatus.PENDING);
      expect(result.payment.platformFee).toBe(100);
      expect(result.redirectUrl).toBe('http://gateway/page');
      // Job stays DISPATCHED until IPN flips to IN_PROGRESS
      expect(txManager.update).not.toHaveBeenCalled();
    });
  });

  describe('handleIpn', () => {
    it('rejects malformed payload', async () => {
      await expect(service.handleIpn({} as any)).rejects.toThrow(BadRequestException);
    });

    it('acks unknown paymentId without processing', async () => {
      txManager.findOne.mockResolvedValue(null);
      const result = await service.handleIpn({
        paymentId: 'PID',
        uniqueIdForMerchant: 'order',
        status: 'SUCCESSFUL',
      });
      expect(result).toEqual({ ok: true, processed: false });
    });

    it('SUCCESSFUL transitions PENDING → HELD and updates Job', async () => {
      const payment = {
        id: 'p',
        status: PaymentStatus.PENDING,
        jobId: 'j',
        ppayTransactionId: null as any,
        heldAt: null as any,
      };
      txManager.findOne.mockResolvedValue(payment);
      const result = await service.handleIpn({
        paymentId: 'PID',
        uniqueIdForMerchant: 'o',
        status: 'SUCCESSFUL',
        transactionId: 'TXN1',
      });
      expect(result.processed).toBe(true);
      expect(payment.status).toBe(PaymentStatus.HELD);
      expect(payment.ppayTransactionId).toBe('TXN1');
      expect(txManager.update).toHaveBeenCalledWith(Job, 'j', { status: JobStatus.IN_PROGRESS });
      expect(emitter.emit).toHaveBeenCalledWith('payment.held', expect.any(Object));
      expect(emitter.emit).toHaveBeenCalledWith('payment.confirmed', expect.any(Object));
    });

    it('duplicate SUCCESSFUL is idempotent', async () => {
      const payment = { id: 'p', status: PaymentStatus.HELD, jobId: 'j' };
      txManager.findOne.mockResolvedValue(payment);
      const result = await service.handleIpn({
        paymentId: 'PID',
        uniqueIdForMerchant: 'o',
        status: 'SUCCESSFUL',
      });
      expect(result).toEqual({ ok: true, processed: false });
      expect(txManager.update).not.toHaveBeenCalled();
    });

    it('FAILED emits event but does not advance state', async () => {
      const payment = { id: 'p', status: PaymentStatus.PENDING, jobId: 'j' };
      txManager.findOne.mockResolvedValue(payment);
      const result = await service.handleIpn({
        paymentId: 'PID',
        uniqueIdForMerchant: 'o',
        status: 'FAILED',
        failReason: 'no balance',
      });
      expect(result.processed).toBe(true);
      expect(payment.status).toBe(PaymentStatus.PENDING);
      expect(emitter.emit).toHaveBeenCalledWith(
        'payment.failed',
        expect.objectContaining({ reason: 'no balance' }),
      );
    });

    it('CANCELLED on already-processed payment is idempotent', async () => {
      const payment = { id: 'p', status: PaymentStatus.HELD, jobId: 'j' };
      txManager.findOne.mockResolvedValue(payment);
      const result = await service.handleIpn({
        paymentId: 'PID',
        uniqueIdForMerchant: 'o',
        status: 'CANCELLED',
      });
      expect(result).toEqual({ ok: true, processed: false });
    });

    it('INITIATED is a no-op ack', async () => {
      const payment = { id: 'p', status: PaymentStatus.PENDING, jobId: 'j' };
      txManager.findOne.mockResolvedValue(payment);
      const result = await service.handleIpn({
        paymentId: 'PID',
        uniqueIdForMerchant: 'o',
        status: 'INITIATED',
      });
      expect(result).toEqual({ ok: true, processed: false });
    });
  });

  describe('queryAndReconcile', () => {
    it('short-circuits when payment not pending', async () => {
      paymentRepo.findOne.mockResolvedValue({ id: 'p', status: PaymentStatus.HELD });
      const result = await service.queryAndReconcile('p');
      expect(result.status).toBe(PaymentStatus.HELD);
      expect(gateway.queryPayment).not.toHaveBeenCalled();
    });

    it('queries gateway and applies SUCCESSFUL transition', async () => {
      paymentRepo.findOne
        .mockResolvedValueOnce({ id: 'p', status: PaymentStatus.PENDING, ppayReference: 'PID' })
        .mockResolvedValueOnce({ id: 'p', status: PaymentStatus.HELD });
      gateway.queryPayment.mockResolvedValue({
        gatewayReference: 'PID',
        uniqueIdForMerchant: 'o',
        status: 'SUCCESSFUL',
        transactionId: 'T',
      });
      const payment = {
        id: 'p',
        status: PaymentStatus.PENDING,
        jobId: 'j',
        ppayTransactionId: null as any,
        heldAt: null as any,
      };
      txManager.findOne.mockResolvedValue(payment);
      await service.queryAndReconcile('p');
      expect(gateway.queryPayment).toHaveBeenCalledWith('PID');
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

    it('releases payment and emits event', async () => {
      const payment: any = {
        id: 'p',
        buyerId: 'me',
        status: PaymentStatus.HELD,
        jobId: 'j',
        ppayReference: 'r',
      };
      txManager.findOne.mockResolvedValue(payment);
      await service.release('p', 'me');
      expect(payment.status).toBe(PaymentStatus.RELEASED);
      expect(payment.releasedAt).toBeInstanceOf(Date);
      expect(emitter.emit).toHaveBeenCalledWith('payment.released', expect.any(Object));
      expect(emitter.emit).toHaveBeenCalledWith('payout.confirmed', expect.any(Object));
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

    it('throws BadRequestException when gateway returns FAILED', async () => {
      txManager.findOne.mockResolvedValue({
        id: 'p',
        buyerId: 'me',
        status: PaymentStatus.HELD,
        amount: 100,
        ppayReference: 'r',
      });
      gateway.refund.mockResolvedValue({ refundId: 'rf', status: 'FAILED', refundFailReason: 'gw' });
      await expect(service.refund('p', 'me')).rejects.toThrow(BadRequestException);
    });

    it('refunds payment on INITIATED/SUCCESSFUL', async () => {
      const payment: any = {
        id: 'p',
        buyerId: 'me',
        status: PaymentStatus.HELD,
        amount: 100,
        ppayReference: 'r',
      };
      txManager.findOne.mockResolvedValue(payment);
      gateway.refund.mockResolvedValue({ refundId: 'rf', status: 'INITIATED' });
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

  describe('findByUser / findById', () => {

    it('returns freelancer payouts with earned and pending totals', async () => {
      const released = {
        id: 'p1',
        jobId: 'j1',
        job: { title: 'Done job' },
        amount: 100,
        platformFee: 10,
        status: PaymentStatus.RELEASED,
        createdAt: new Date('2026-01-01T00:00:00Z'),
      };
      const held = {
        id: 'p2',
        jobId: 'j2',
        job: { title: 'Active job' },
        amount: 200,
        platformFee: 20,
        status: PaymentStatus.HELD,
        createdAt: new Date('2026-01-02T00:00:00Z'),
      };
      paymentRepo.findAndCount.mockResolvedValue([[released, held], 2]);
      paymentRepo.find.mockResolvedValue([released, held]);
      const result = await service.findFreelancerPayouts('f', 1, 20);
      expect(result.items[0]).toEqual(expect.objectContaining({
        id: 'p1',
        jobTitle: 'Done job',
        netAmount: 90,
      }));
      expect(result.totalEarned).toBe(90);
      expect(result.totalPending).toBe(180);
    });

    it('returns payments for buyer or freelancer', async () => {
      paymentRepo.find.mockResolvedValue([{ id: 'p1' }]);
      const result = await service.findByUser('u');
      expect(result).toHaveLength(1);
    });
    it('findById returns payment', async () => {
      paymentRepo.findOne.mockResolvedValue({ id: 'p' });
      const p = await service.findById('p');
      expect(p.id).toBe('p');
    });
    it('findById throws NotFoundException when missing', async () => {
      paymentRepo.findOne.mockResolvedValue(null);
      await expect(service.findById('p')).rejects.toThrow(NotFoundException);
    });
  });
});
