import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Repository } from 'typeorm';
import { BidderAgent, BidderAgentStatus } from './bidder-agent.entity';
import { BidderAgentPromptHistory } from './bidder-agent-prompt-history.entity';
import { ScoringService } from './scoring.service';
import { BidsService } from '../bids/bids.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { JobPostedEvent } from '../jobs/jobs.service';
import { BidType } from '../bids/bid.entity';
import { v4 as uuidv4 } from 'uuid';

export const BIDDER_QUEUE = 'bidder-agent';

@Injectable()
export class BidderAgentService {
  constructor(
    @InjectRepository(BidderAgent) private agentRepo: Repository<BidderAgent>,
    @InjectRepository(BidderAgentPromptHistory) private historyRepo: Repository<BidderAgentPromptHistory>,
    @InjectQueue(BIDDER_QUEUE) private bidderQueue: Queue,
    private scoringService: ScoringService,
    private bidsService: BidsService,
    private auditLogService: AuditLogService,
  ) {}

  async provision(userId: string): Promise<BidderAgent> {
    const existing = await this.agentRepo.findOne({ where: { userId } });
    if (existing) return existing;

    return this.agentRepo.save(
      this.agentRepo.create({ id: uuidv4(), userId }),
    );
  }

  async findByUser(userId: string): Promise<BidderAgent> {
    const agent = await this.agentRepo.findOne({ where: { userId } });
    if (!agent) throw new NotFoundException('Bidder agent not found');
    return agent;
  }

  async update(
    userId: string,
    dto: {
      nlConfig?: string;
      bidThreshold?: number;
      maxBidAmount?: number;
      autoBidEnabled?: boolean;
      status?: BidderAgentStatus;
    },
  ): Promise<BidderAgent> {
    const agent = await this.findByUser(userId);

    if (dto.nlConfig !== undefined) {
      const parsedRules = this.scoringService.parseNlConfig(dto.nlConfig);
      agent.nlConfig = dto.nlConfig;
      agent.scoringRules = parsedRules;

      await this.savePromptHistory(agent.id, dto.nlConfig, parsedRules);
    }
    if (dto.bidThreshold !== undefined) agent.bidThreshold = dto.bidThreshold;
    if (dto.maxBidAmount !== undefined) agent.maxBidAmount = dto.maxBidAmount;
    if (dto.autoBidEnabled !== undefined) agent.autoBidEnabled = dto.autoBidEnabled;
    if (dto.status !== undefined) agent.status = dto.status;

    return this.agentRepo.save(agent);
  }

  private async savePromptHistory(
    agentId: string,
    nlConfig: string,
    parsedRules: BidderAgent['scoringRules'],
  ): Promise<void> {
    await this.historyRepo.save(
      this.historyRepo.create({ id: uuidv4(), agentId, nlConfig, parsedRules }),
    );

    const count = await this.historyRepo.count({ where: { agentId } });
    if (count > 20) {
      const oldest = await this.historyRepo.find({
        where: { agentId },
        order: { createdAt: 'ASC' },
        take: count - 20,
      });
      await this.historyRepo.remove(oldest);
    }
  }

  async findPromptHistory(userId: string): Promise<BidderAgentPromptHistory[]> {
    const agent = await this.findByUser(userId);
    return this.historyRepo.find({
      where: { agentId: agent.id },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async testScore(userId: string, jobSnapshot: { title: string; description: string; category?: string; skillsRequired?: string[]; budgetMin?: number; budgetMax?: number; deadline?: Date }) {
    const agent = await this.findByUser(userId);
    return this.scoringService.score(agent, jobSnapshot as any);
  }

  @OnEvent('user.registered')
  async onUserRegistered(event: { userId: string; role: string }) {
    if (event.role === 'freelancer') {
      await this.provision(event.userId);
    }
  }

  @OnEvent('job.posted')
  async onJobPosted(event: JobPostedEvent) {
    const agents = await this.agentRepo.find({
      where: { status: BidderAgentStatus.ACTIVE, autoBidEnabled: true },
    });

    for (const agent of agents) {
      if (agent.userId === event.job.buyerId) continue;
      await this.bidderQueue.add(
        'score-job',
        { agentId: agent.id, jobId: event.job.id },
        { attempts: 3, backoff: { type: 'exponential', delay: 1000 } },
      );
    }
  }

  async processScoreJob(agentId: string, jobId: string): Promise<void> {
    const agent = await this.agentRepo.findOne({ where: { id: agentId } });
    if (!agent || agent.status !== BidderAgentStatus.ACTIVE || !agent.autoBidEnabled) return;
  }

  async processScoreJobWithData(
    agent: BidderAgent,
    job: any,
  ): Promise<void> {
    const breakdown = this.scoringService.score(agent, job);

    if (breakdown.total < Number(agent.bidThreshold)) return;

    const bidAmount = agent.maxBidAmount
      ? Math.min(Number(agent.maxBidAmount), Number(job.budgetMax ?? job.budgetMin ?? 100))
      : Number(job.budgetMax ?? job.budgetMin ?? 100);

    try {
      const bid = await this.bidsService.create(
        job.id,
        agent.userId,
        { amount: bidAmount, proposal: `Auto-bid from Bidder Agent (score: ${breakdown.total})` },
        BidType.AUTO,
        breakdown.total,
      );

      await this.auditLogService.write({
        actorId: agent.userId,
        actorType: 'user',
        action: 'BID_CREATED_AUTO',
        resourceType: 'bids',
        resourceId: bid?.id,
        metadata: { jobId: job.id, score: breakdown.total, amount: bidAmount },
      });
    } catch {
      // Conflict (already bid) or job not open — skip silently
    }
  }

  async findBidHistory(userId: string) {
    return this.bidsService.findByBidder(userId);
  }
}
