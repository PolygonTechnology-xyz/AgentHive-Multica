import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bull';
import { BidderAgentService, BIDDER_QUEUE } from './bidder-agent.service';
import { BidderAgent, BidderAgentStatus } from './bidder-agent.entity';
import { ScoringService } from './scoring.service';
import { BidsService } from '../bids/bids.service';
import { BidType } from '../bids/bid.entity';

describe('BidderAgentService', () => {
  let service: BidderAgentService;
  let agentRepo: any;
  let queue: any;
  let scoring: any;
  let bids: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    agentRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((d) => d),
      save: jest.fn((d) => Promise.resolve(d)),
    };
    queue = { add: jest.fn() };
    scoring = {
      score: jest.fn(),
      parseNlConfig: jest.fn().mockReturnValue({ preferredCategories: ['web'] }),
    };
    bids = { create: jest.fn(), findByBidder: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BidderAgentService,
        { provide: getRepositoryToken(BidderAgent), useValue: agentRepo },
        { provide: getQueueToken(BIDDER_QUEUE), useValue: queue },
        { provide: ScoringService, useValue: scoring },
        { provide: BidsService, useValue: bids },
      ],
    }).compile();
    service = module.get<BidderAgentService>(BidderAgentService);
  });

  describe('provision', () => {
    it('returns existing agent (idempotent)', async () => {
      agentRepo.findOne.mockResolvedValue({ id: 'a1' });
      const result = await service.provision('u1');
      expect(result.id).toBe('a1');
      expect(agentRepo.save).not.toHaveBeenCalled();
    });

    it('creates a new agent when none exists', async () => {
      agentRepo.findOne.mockResolvedValue(null);
      const result: any = await service.provision('u1');
      expect(result.userId).toBe('u1');
      expect(agentRepo.save).toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('returns agent', async () => {
      agentRepo.findOne.mockResolvedValue({ id: 'a1' });
      const result = await service.findByUser('u');
      expect(result.id).toBe('a1');
    });
    it('throws NotFoundException when missing', async () => {
      agentRepo.findOne.mockResolvedValue(null);
      await expect(service.findByUser('u')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('applies nlConfig + parses scoringRules', async () => {
      const agent: any = { id: 'a', userId: 'u' };
      agentRepo.findOne.mockResolvedValue(agent);
      const result: any = await service.update('u', { nlConfig: 'web work', bidThreshold: 80, maxBidAmount: 500, autoBidEnabled: false, status: BidderAgentStatus.PAUSED });
      expect(scoring.parseNlConfig).toHaveBeenCalledWith('web work');
      expect(result.bidThreshold).toBe(80);
      expect(result.maxBidAmount).toBe(500);
      expect(result.autoBidEnabled).toBe(false);
      expect(result.status).toBe(BidderAgentStatus.PAUSED);
    });

    it('updates only provided fields', async () => {
      const agent: any = { id: 'a', userId: 'u', bidThreshold: 70 };
      agentRepo.findOne.mockResolvedValue(agent);
      const result: any = await service.update('u', { bidThreshold: 90 });
      expect(result.bidThreshold).toBe(90);
      expect(scoring.parseNlConfig).not.toHaveBeenCalled();
    });
  });

  describe('testScore', () => {
    it('returns scoring result', async () => {
      const agent: any = { id: 'a' };
      agentRepo.findOne.mockResolvedValue(agent);
      scoring.score.mockReturnValue({ total: 80 });
      const result = await service.testScore('u', { title: 't', description: 'd' });
      expect(result.total).toBe(80);
    });
  });

  describe('onUserRegistered', () => {
    it('provisions when role=freelancer', async () => {
      agentRepo.findOne.mockResolvedValue(null);
      await service.onUserRegistered({ userId: 'u', role: 'freelancer' });
      expect(agentRepo.save).toHaveBeenCalled();
    });
    it('does not provision for non-freelancer', async () => {
      await service.onUserRegistered({ userId: 'u', role: 'buyer' });
      expect(agentRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('onJobPosted', () => {
    it('queues scoring jobs skipping job owner', async () => {
      agentRepo.find.mockResolvedValue([
        { id: 'a1', userId: 'buyer1' },
        { id: 'a2', userId: 'other' },
      ]);
      await service.onJobPosted({ job: { id: 'j', buyerId: 'buyer1' } } as any);
      expect(queue.add).toHaveBeenCalledTimes(1);
      expect(queue.add).toHaveBeenCalledWith(
        'score-job',
        expect.objectContaining({ agentId: 'a2', jobId: 'j' }),
        expect.any(Object),
      );
    });
  });

  describe('processScoreJob', () => {
    it('returns early when agent missing', async () => {
      agentRepo.findOne.mockResolvedValue(null);
      await expect(service.processScoreJob('a', 'j')).resolves.toBeUndefined();
    });
    it('returns early when agent paused', async () => {
      agentRepo.findOne.mockResolvedValue({ id: 'a', status: BidderAgentStatus.PAUSED, autoBidEnabled: true });
      await expect(service.processScoreJob('a', 'j')).resolves.toBeUndefined();
    });
    it('returns early when autoBidEnabled false', async () => {
      agentRepo.findOne.mockResolvedValue({ id: 'a', status: BidderAgentStatus.ACTIVE, autoBidEnabled: false });
      await expect(service.processScoreJob('a', 'j')).resolves.toBeUndefined();
    });
    it('proceeds when active + enabled', async () => {
      agentRepo.findOne.mockResolvedValue({ id: 'a', status: BidderAgentStatus.ACTIVE, autoBidEnabled: true });
      await expect(service.processScoreJob('a', 'j')).resolves.toBeUndefined();
    });
  });

  describe('processScoreJobWithData', () => {
    it('skips when score below threshold', async () => {
      scoring.score.mockReturnValue({ total: 50 });
      await service.processScoreJobWithData({ bidThreshold: 70 } as any, { id: 'j' });
      expect(bids.create).not.toHaveBeenCalled();
    });

    it('places bid with maxBidAmount cap', async () => {
      scoring.score.mockReturnValue({ total: 90 });
      await service.processScoreJobWithData(
        { id: 'a', userId: 'u', bidThreshold: 70, maxBidAmount: 200 } as any,
        { id: 'j', budgetMax: 500 },
      );
      expect(bids.create).toHaveBeenCalledWith(
        'j', 'u',
        expect.objectContaining({ amount: 200 }),
        BidType.AUTO,
        90,
      );
    });

    it('uses budgetMax when no maxBidAmount', async () => {
      scoring.score.mockReturnValue({ total: 90 });
      await service.processScoreJobWithData(
        { id: 'a', userId: 'u', bidThreshold: 70, maxBidAmount: null } as any,
        { id: 'j', budgetMax: 300 },
      );
      expect(bids.create).toHaveBeenCalledWith(
        'j', 'u',
        expect.objectContaining({ amount: 300 }),
        BidType.AUTO,
        90,
      );
    });

    it('falls back to budgetMin when no budgetMax', async () => {
      scoring.score.mockReturnValue({ total: 90 });
      await service.processScoreJobWithData(
        { id: 'a', userId: 'u', bidThreshold: 70, maxBidAmount: null } as any,
        { id: 'j', budgetMin: 150 },
      );
      expect(bids.create).toHaveBeenCalledWith(
        'j', 'u',
        expect.objectContaining({ amount: 150 }),
        BidType.AUTO,
        90,
      );
    });

    it('falls back to default 100 when no budget data', async () => {
      scoring.score.mockReturnValue({ total: 90 });
      await service.processScoreJobWithData(
        { id: 'a', userId: 'u', bidThreshold: 70, maxBidAmount: null } as any,
        { id: 'j' },
      );
      expect(bids.create).toHaveBeenCalledWith(
        'j', 'u',
        expect.objectContaining({ amount: 100 }),
        BidType.AUTO,
        90,
      );
    });

    it('swallows bids.create errors silently', async () => {
      scoring.score.mockReturnValue({ total: 90 });
      bids.create.mockRejectedValue(new Error('already bid'));
      await expect(
        service.processScoreJobWithData(
          { id: 'a', userId: 'u', bidThreshold: 70, maxBidAmount: null } as any,
          { id: 'j', budgetMax: 100 },
        ),
      ).resolves.toBeUndefined();
    });
  });

  describe('findBidHistory', () => {
    it('delegates to bids service', async () => {
      bids.findByBidder.mockResolvedValue([{ id: 'b1' }]);
      const result = await service.findBidHistory('u');
      expect(result).toHaveLength(1);
    });
  });
});
