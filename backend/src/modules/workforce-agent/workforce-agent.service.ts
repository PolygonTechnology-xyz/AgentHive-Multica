import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkforceAgent } from './workforce-agent.entity';
import { BidderAgent, BidderAgentStatus } from '../bidder-agent/bidder-agent.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WorkforceAgentService {
  constructor(
    @InjectRepository(WorkforceAgent) private waRepo: Repository<WorkforceAgent>,
    @InjectRepository(BidderAgent) private bidderRepo: Repository<BidderAgent>,
  ) {}

  async register(userId: string, dto: { name: string; capabilities: string[] }): Promise<WorkforceAgent> {
    const existingCount = await this.waRepo.count({ where: { userId } });

    const wa = await this.waRepo.save(
      this.waRepo.create({ id: uuidv4(), userId, name: dto.name, capabilities: dto.capabilities }),
    );

    if (existingCount === 0) {
      await this.bidderRepo.update(
        { userId, status: BidderAgentStatus.DORMANT },
        { status: BidderAgentStatus.ACTIVE },
      );
    }

    return wa;
  }

  async findByUser(userId: string): Promise<WorkforceAgent[]> {
    return this.waRepo.find({ where: { userId }, order: { connectedAt: 'DESC' } });
  }
}
