import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DispatchService } from './dispatch.service';
import { Dispatch, DispatchStatus } from './dispatch.entity';
import { Job } from '../jobs/job.entity';
import { Bid, BidStatus } from '../bids/bid.entity';

describe('DispatchService', () => {
  let service: DispatchService;
  let dispatchRepo: any;
  let jobRepo: any;
  let bidRepo: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    dispatchRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((d) => d),
      save: jest.fn((d) => Promise.resolve(d)),
      update: jest.fn(),
    };
    jobRepo = { findOne: jest.fn() };
    bidRepo = { findOne: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatchService,
        { provide: getRepositoryToken(Dispatch), useValue: dispatchRepo },
        { provide: getRepositoryToken(Job), useValue: jobRepo },
        { provide: getRepositoryToken(Bid), useValue: bidRepo },
      ],
    }).compile();
    service = module.get<DispatchService>(DispatchService);
  });

  describe('onPaymentHeld', () => {
    it('returns silently when job missing', async () => {
      jobRepo.findOne.mockResolvedValue(null);
      await service.onPaymentHeld({ paymentId: 'p', jobId: 'j' });
      expect(dispatchRepo.save).not.toHaveBeenCalled();
    });

    it('returns silently when no accepted bid', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j' });
      bidRepo.findOne.mockResolvedValue(null);
      await service.onPaymentHeld({ paymentId: 'p', jobId: 'j' });
      expect(dispatchRepo.save).not.toHaveBeenCalled();
    });

    it('returns silently when dispatch exists', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j' });
      bidRepo.findOne.mockResolvedValue({ id: 'b', bidderId: 'f', deliveryDays: 5 });
      dispatchRepo.findOne.mockResolvedValue({ id: 'existing' });
      await service.onPaymentHeld({ paymentId: 'p', jobId: 'j' });
      expect(dispatchRepo.save).not.toHaveBeenCalled();
    });

    it('creates new dispatch with dueAt when deliveryDays present', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j' });
      bidRepo.findOne.mockResolvedValue({ id: 'b', bidderId: 'f', deliveryDays: 3 });
      dispatchRepo.findOne.mockResolvedValue(null);
      await service.onPaymentHeld({ paymentId: 'p', jobId: 'j' });
      expect(dispatchRepo.save).toHaveBeenCalled();
      const arg = dispatchRepo.create.mock.calls[0][0];
      expect(arg.dueAt).toBeInstanceOf(Date);
    });

    it('creates new dispatch with no dueAt when no deliveryDays', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j' });
      bidRepo.findOne.mockResolvedValue({ id: 'b', bidderId: 'f', deliveryDays: null });
      dispatchRepo.findOne.mockResolvedValue(null);
      await service.onPaymentHeld({ paymentId: 'p', jobId: 'j' });
      const arg = dispatchRepo.create.mock.calls[0][0];
      expect(arg.dueAt).toBeUndefined();
    });
  });

  describe('findByJob', () => {
    it('returns matching dispatch', async () => {
      dispatchRepo.findOne.mockResolvedValue({ id: 'd1' });
      const result = await service.findByJob('j');
      expect(result?.id).toBe('d1');
    });
  });

  describe('findActive', () => {
    it('returns active dispatches for freelancer', async () => {
      dispatchRepo.find.mockResolvedValue([{ id: 'd1' }]);
      const result = await service.findActive('u1');
      expect(result).toHaveLength(1);
    });
  });

  describe('start', () => {
    it('throws NotFoundException when dispatch missing', async () => {
      dispatchRepo.findOne.mockResolvedValue(null);
      await expect(service.start('j', 'f')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when not freelancer', async () => {
      dispatchRepo.findOne.mockResolvedValue({ freelancerId: 'other' });
      await expect(service.start('j', 'me')).rejects.toThrow(ForbiddenException);
    });

    it('sets IN_PROGRESS and startedAt', async () => {
      const d: any = { freelancerId: 'me', status: DispatchStatus.ASSIGNED };
      dispatchRepo.findOne.mockResolvedValue(d);
      const result = await service.start('j', 'me');
      expect(result.status).toBe(DispatchStatus.IN_PROGRESS);
      expect(result.startedAt).toBeInstanceOf(Date);
    });
  });

  describe('updateStatus', () => {
    it('calls repo.update', async () => {
      await service.updateStatus('j', DispatchStatus.COMPLETED);
      expect(dispatchRepo.update).toHaveBeenCalledWith({ jobId: 'j' }, { status: DispatchStatus.COMPLETED });
    });
  });

  describe('findByFreelancer', () => {
    it('returns dispatches', async () => {
      dispatchRepo.find.mockResolvedValue([{ id: 'd1' }, { id: 'd2' }]);
      const result = await service.findByFreelancer('u');
      expect(result).toHaveLength(2);
    });
  });
});
