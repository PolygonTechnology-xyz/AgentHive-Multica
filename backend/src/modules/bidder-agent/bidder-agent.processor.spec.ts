import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BidderAgentProcessor } from './bidder-agent.processor';
import { BidderAgentService } from './bidder-agent.service';
import { BidderAgent } from './bidder-agent.entity';
import { Job } from '../jobs/job.entity';

describe('BidderAgentProcessor', () => {
  let processor: BidderAgentProcessor;
  let svc: any;
  let agentRepo: any;
  let jobRepo: any;

  beforeEach(async () => {
    svc = { processScoreJobWithData: jest.fn() };
    agentRepo = { findOne: jest.fn() };
    jobRepo = { findOne: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BidderAgentProcessor,
        { provide: BidderAgentService, useValue: svc },
        { provide: getRepositoryToken(BidderAgent), useValue: agentRepo },
        { provide: getRepositoryToken(Job), useValue: jobRepo },
      ],
    }).compile();
    processor = module.get<BidderAgentProcessor>(BidderAgentProcessor);
  });

  it('returns silently when agent missing', async () => {
    agentRepo.findOne.mockResolvedValue(null);
    jobRepo.findOne.mockResolvedValue({ id: 'j' });
    await processor.process({ data: { agentId: 'a', jobId: 'j' } } as any);
    expect(svc.processScoreJobWithData).not.toHaveBeenCalled();
  });

  it('returns silently when job missing', async () => {
    agentRepo.findOne.mockResolvedValue({ id: 'a' });
    jobRepo.findOne.mockResolvedValue(null);
    await processor.process({ data: { agentId: 'a', jobId: 'j' } } as any);
    expect(svc.processScoreJobWithData).not.toHaveBeenCalled();
  });

  it('calls service with agent and job', async () => {
    agentRepo.findOne.mockResolvedValue({ id: 'a' });
    jobRepo.findOne.mockResolvedValue({ id: 'j' });
    await processor.process({ data: { agentId: 'a', jobId: 'j' } } as any);
    expect(svc.processScoreJobWithData).toHaveBeenCalledWith({ id: 'a' }, { id: 'j' });
  });

  it('logs and rethrows on error', async () => {
    agentRepo.findOne.mockRejectedValue(new Error('boom'));
    await expect(
      processor.process({ data: { agentId: 'a', jobId: 'j' } } as any),
    ).rejects.toThrow('boom');
  });
});
