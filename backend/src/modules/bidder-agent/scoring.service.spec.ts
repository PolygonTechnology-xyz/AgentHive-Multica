import { Test, TestingModule } from '@nestjs/testing';
import { ScoringService } from './scoring.service';
import { BidderAgentStatus } from './bidder-agent.entity';
import { JobStatus } from '../jobs/job.entity';

const makeAgent = (overrides = {}) => ({
  id: '1',
  userId: 'u1',
  status: BidderAgentStatus.ACTIVE,
  autoBidEnabled: true,
  bidThreshold: 70,
  maxBidAmount: null,
  nlConfig: null,
  scoringRules: {
    preferredCategories: ['web'],
    preferredSkills: ['react', 'typescript'],
    budgetMin: 100,
    budgetMax: 1000,
  },
  ...overrides,
});

const makeJob = (overrides = {}) => ({
  id: 'j1',
  buyerId: 'buyer1',
  title: 'Build a React dashboard',
  description: 'Need a dashboard built',
  category: 'web',
  skillsRequired: ['react', 'typescript'],
  budgetMin: 200,
  budgetMax: 500,
  deadline: new Date(Date.now() + 7 * 24 * 3600 * 1000),
  status: JobStatus.OPEN,
  ...overrides,
});

describe('ScoringService', () => {
  let service: ScoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScoringService],
    }).compile();
    service = module.get<ScoringService>(ScoringService);
  });

  it('returns high score for perfect match', () => {
    const result = service.score(makeAgent() as any, makeJob() as any);
    expect(result.total).toBeGreaterThanOrEqual(90);
    expect(result.categoryMatch).toBe(40);
    expect(result.skillsMatch).toBe(30);
    expect(result.budgetFit).toBe(20);
  });

  it('returns low score for category mismatch', () => {
    const result = service.score(
      makeAgent() as any,
      makeJob({ category: 'marketing', skillsRequired: [] }) as any,
    );
    expect(result.categoryMatch).toBe(5);
  });

  it('penalizes job with budget below agent min', () => {
    const result = service.score(
      makeAgent() as any,
      makeJob({ budgetMax: 50 }) as any,
    );
    expect(result.budgetFit).toBe(0);
  });

  it('penalizes tight deadline (< 1 day)', () => {
    const result = service.score(
      makeAgent() as any,
      makeJob({ deadline: new Date(Date.now() + 6 * 3600 * 1000) }) as any,
    );
    expect(result.deadlineFeasibility).toBe(0);
  });

  describe('parseNlConfig', () => {
    it('extracts budget range', () => {
      const rules = service.parseNlConfig('I prefer web projects with budget between 200 and 800');
      expect(rules.budgetMin).toBe(200);
      expect(rules.budgetMax).toBe(800);
    });

    it('extracts preferred categories', () => {
      const rules = service.parseNlConfig('I do react and backend work');
      expect(rules.preferredCategories).toContain('backend');
      expect(rules.preferredSkills).toContain('react');
    });
  });
});
