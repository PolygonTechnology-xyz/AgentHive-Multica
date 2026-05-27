import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BidsService } from './bids.service';
import { Bid, BidStatus, BidType } from './bid.entity';
import { Job, JobStatus } from '../jobs/job.entity';

describe('BidsService', () => {
  let service: BidsService;
  let bidRepo: any;
  let jobRepo: any;
  let dataSource: any;
  let txManager: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    bidRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((d) => d),
      save: jest.fn((d) => Promise.resolve(d)),
    };
    jobRepo = {
      findOne: jest.fn(),
    };
    txManager = {
      findOne: jest.fn(),
      update: jest.fn(),
      save: jest.fn((d) => Promise.resolve(d)),
    };
    dataSource = {
      transaction: jest.fn((cb: any) => cb(txManager)),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BidsService,
        { provide: getRepositoryToken(Bid), useValue: bidRepo },
        { provide: getRepositoryToken(Job), useValue: jobRepo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();
    service = module.get<BidsService>(BidsService);
  });

  describe('create', () => {
    it('throws NotFoundException when job missing', async () => {
      jobRepo.findOne.mockResolvedValue(null);
      await expect(
        service.create('j1', 'b1', { amount: 100 } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when job not OPEN', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j1', status: JobStatus.DISPATCHED, buyerId: 'buyer' });
      await expect(
        service.create('j1', 'b1', { amount: 100 } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when bidding on own job', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j1', status: JobStatus.OPEN, buyerId: 'self' });
      await expect(
        service.create('j1', 'self', { amount: 100 } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException when bid exists', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j1', status: JobStatus.OPEN, buyerId: 'buyer' });
      bidRepo.findOne.mockResolvedValue({ id: 'existing' });
      await expect(
        service.create('j1', 'b1', { amount: 100 } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('creates bid with provided dto + type + score', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j1', status: JobStatus.OPEN, buyerId: 'buyer' });
      bidRepo.findOne.mockResolvedValue(null);
      const result: any = await service.create('j1', 'b1', { amount: 200, proposal: 'p', deliveryDays: 5 } as any, BidType.AUTO, 88);
      expect(result.amount).toBe(200);
      expect(result.bidType).toBe(BidType.AUTO);
      expect(result.score).toBe(88);
    });
  });

  describe('findByJob', () => {
    it('throws NotFoundException when job missing', async () => {
      jobRepo.findOne.mockResolvedValue(null);
      await expect(service.findByJob('j1', 'u', 'buyer')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when buyer not owner', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j1', buyerId: 'other' });
      await expect(service.findByJob('j1', 'me', 'buyer')).rejects.toThrow(ForbiddenException);
    });

    it('returns only own bids for freelancer', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j1', buyerId: 'b' });
      bidRepo.find.mockResolvedValue([{ id: 'bid1', bidderId: 'me' }]);
      const bids = await service.findByJob('j1', 'me', 'freelancer');
      expect(bidRepo.find).toHaveBeenCalledWith({ where: { jobId: 'j1', bidderId: 'me' } });
      expect(bids).toHaveLength(1);
    });

    it('returns all bids for buyer who owns the job', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j1', buyerId: 'me' });
      bidRepo.find.mockResolvedValue([{ id: 'b1' }, { id: 'b2' }]);
      const bids = await service.findByJob('j1', 'me', 'buyer');
      expect(bids).toHaveLength(2);
    });

    it('returns all bids for admin', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j1', buyerId: 'b' });
      bidRepo.find.mockResolvedValue([{ id: 'b1' }]);
      const bids = await service.findByJob('j1', 'me', 'admin');
      expect(bids).toHaveLength(1);
    });
  });

  describe('findByBidder', () => {
    it('returns user bids ordered by creation', async () => {
      bidRepo.find.mockResolvedValue([{ id: 'b1' }]);
      const result = await service.findByBidder('me');
      expect(result).toHaveLength(1);
    });
  });

  describe('accept', () => {
    it('throws NotFoundException when job missing', async () => {
      txManager.findOne.mockResolvedValueOnce(null);
      await expect(service.accept('j1', 'bid1', 'buyer')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when not buyer', async () => {
      txManager.findOne.mockResolvedValueOnce({ id: 'j1', buyerId: 'other', status: JobStatus.OPEN });
      await expect(service.accept('j1', 'bid1', 'me')).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException when job not OPEN', async () => {
      txManager.findOne.mockResolvedValueOnce({ id: 'j1', buyerId: 'me', status: JobStatus.CANCELLED });
      await expect(service.accept('j1', 'bid1', 'me')).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when bid missing', async () => {
      txManager.findOne.mockResolvedValueOnce({ id: 'j1', buyerId: 'me', status: JobStatus.OPEN });
      txManager.findOne.mockResolvedValueOnce(null);
      await expect(service.accept('j1', 'bid1', 'me')).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when bid not pending', async () => {
      txManager.findOne.mockResolvedValueOnce({ id: 'j1', buyerId: 'me', status: JobStatus.OPEN });
      txManager.findOne.mockResolvedValueOnce({ id: 'bid1', status: BidStatus.REJECTED });
      await expect(service.accept('j1', 'bid1', 'me')).rejects.toThrow(BadRequestException);
    });

    it('rejects other bids, marks bid accepted, and dispatches job', async () => {
      const job = { id: 'j1', buyerId: 'me', status: JobStatus.OPEN };
      const bid = { id: 'bid1', status: BidStatus.PENDING };
      txManager.findOne.mockResolvedValueOnce(job).mockResolvedValueOnce(bid);
      const result = await service.accept('j1', 'bid1', 'me');
      expect(result.status).toBe(BidStatus.ACCEPTED);
      expect(job.status).toBe(JobStatus.DISPATCHED);
      expect(txManager.update).toHaveBeenCalled();
    });
  });

  describe('reject', () => {
    it('throws NotFoundException when job missing', async () => {
      jobRepo.findOne.mockResolvedValue(null);
      await expect(service.reject('j1', 'b1', 'me')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when not buyer', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j1', buyerId: 'other' });
      await expect(service.reject('j1', 'b1', 'me')).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when bid missing', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j1', buyerId: 'me' });
      bidRepo.findOne.mockResolvedValue(null);
      await expect(service.reject('j1', 'b1', 'me')).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when bid not pending', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j1', buyerId: 'me' });
      bidRepo.findOne.mockResolvedValue({ id: 'b1', status: BidStatus.ACCEPTED });
      await expect(service.reject('j1', 'b1', 'me')).rejects.toThrow(BadRequestException);
    });

    it('marks bid REJECTED', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j1', buyerId: 'me' });
      const bid: any = { id: 'b1', status: BidStatus.PENDING };
      bidRepo.findOne.mockResolvedValue(bid);
      const result = await service.reject('j1', 'b1', 'me');
      expect(result.status).toBe(BidStatus.REJECTED);
    });
  });
});
