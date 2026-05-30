import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Not, Repository } from 'typeorm';
import { BIDDER_QUEUE } from '../bidder-agent/bidder-agent.service';
import { ConnectWorkforceAgentDto } from './dto/connect-workforce-agent.dto';
import { WorkforceAgent, WorkforceAgentStatus } from './workforce-agent.entity';

@Injectable()
export class WorkforceAgentsService {
  constructor(
    @InjectRepository(WorkforceAgent) private workforceAgentRepo: Repository<WorkforceAgent>,
    @InjectQueue(BIDDER_QUEUE) private bidderQueue: Queue,
  ) {}

  async create(userId: string, dto: ConnectWorkforceAgentDto): Promise<WorkforceAgent> {
    const agent = await this.workforceAgentRepo.save(
      this.workforceAgentRepo.create({
        userId,
        name: dto.name.trim(),
        skillIndex: this.normalizeSkills(dto.skills),
        status: WorkforceAgentStatus.ACTIVE,
      }),
    );
    await this.enqueueReindex(userId);
    return agent;
  }

  async listForUser(userId: string): Promise<WorkforceAgent[]> {
    return this.workforceAgentRepo.find({
      where: { userId, status: Not(WorkforceAgentStatus.REMOVED) },
      order: { createdAt: 'ASC' },
    });
  }

  async deactivate(userId: string, id: string): Promise<WorkforceAgent> {
    const agent = await this.findOwned(userId, id);
    agent.status = WorkforceAgentStatus.INACTIVE;
    const saved = await this.workforceAgentRepo.save(agent);
    await this.enqueueReindex(userId);
    return saved;
  }

  async remove(userId: string, id: string): Promise<WorkforceAgent> {
    const agent = await this.findOwned(userId, id);
    agent.status = WorkforceAgentStatus.REMOVED;
    const saved = await this.workforceAgentRepo.save(agent);
    await this.enqueueReindex(userId);
    return saved;
  }

  private async findOwned(userId: string, id: string): Promise<WorkforceAgent> {
    const agent = await this.workforceAgentRepo.findOne({ where: { id } });
    if (!agent) throw new NotFoundException('Workforce agent not found');
    if (agent.userId !== userId) throw new ForbiddenException('Workforce agent belongs to another user');
    if (agent.status === WorkforceAgentStatus.REMOVED) throw new NotFoundException('Workforce agent not found');
    return agent;
  }

  private async enqueueReindex(userId: string): Promise<void> {
    await this.bidderQueue.add('reindex', { userId }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
  }

  private normalizeSkills(skills: string[]): string[] {
    return Array.from(new Set(skills.map((skill) => skill.trim()).filter(Boolean)));
  }
}
