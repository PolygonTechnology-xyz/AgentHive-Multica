import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job as BullJob } from 'bull';
import { BIDDER_QUEUE, BidderAgentService } from './bidder-agent.service';
import { BidderAgent } from './bidder-agent.entity';
import { Job } from '../jobs/job.entity';

@Processor(BIDDER_QUEUE)
export class BidderAgentProcessor {
  private readonly logger = new Logger(BidderAgentProcessor.name);

  constructor(
    private bidderAgentService: BidderAgentService,
    @InjectRepository(BidderAgent) private agentRepo: Repository<BidderAgent>,
    @InjectRepository(Job) private jobRepo: Repository<Job>,
  ) {}

  @Process('reindex')
  async reindex(bullJob: BullJob<{ userId: string }>) {
    await this.bidderAgentService.reindexForUser(bullJob.data.userId);
  }

  @Process('score-job')
  async process(bullJob: BullJob<{ agentId: string; jobId: string }>) {
    const { agentId, jobId } = bullJob.data;

    try {
      const [agent, job] = await Promise.all([
        this.agentRepo.findOne({ where: { id: agentId } }),
        this.jobRepo.findOne({ where: { id: jobId } }),
      ]);

      if (!agent || !job) return;

      await this.bidderAgentService.processScoreJobWithData(agent, job);
    } catch (err) {
      this.logger.error(`score-job failed agentId=${agentId} jobId=${jobId}: ${err.message}`);
      throw err;
    }
  }
}
