import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { v4 as uuidv4 } from 'uuid';

export type WriteAuditDto = {
  actorId?: string;
  actorType?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
};

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(@InjectRepository(AuditLog) private repo: Repository<AuditLog>) {}

  async write(dto: WriteAuditDto): Promise<void> {
    try {
      await this.repo.save(
        this.repo.create({
          id: uuidv4(),
          actorId: dto.actorId,
          actorType: dto.actorType ?? (dto.actorId ? 'user' : 'anonymous'),
          action: dto.action,
          resourceType: dto.resourceType,
          resourceId: dto.resourceId,
          metadata: dto.metadata,
          ipAddress: dto.ipAddress,
        }),
      );
    } catch (err) {
      // Never let audit write failure propagate — log and move on
      this.logger.error(`Audit write failed: ${err.message}`);
    }
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    actorId?: string;
    resourceType?: string;
    resourceId?: string;
    since?: Date;
    until?: Date;
  }): Promise<{ items: AuditLog[]; total: number }> {
    const { page = 1, limit = 50, actorId, resourceType, resourceId, since, until } = options;

    const qb = this.repo.createQueryBuilder('al').orderBy('al.created_at', 'DESC');

    if (actorId) qb.andWhere('al.actor_id = :actorId', { actorId });
    if (resourceType) qb.andWhere('al.resource_type = :resourceType', { resourceType });
    if (resourceId) qb.andWhere('al.resource_id = :resourceId', { resourceId });
    if (since) qb.andWhere('al.created_at >= :since', { since });
    if (until) qb.andWhere('al.created_at <= :until', { until });

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total };
  }
}
