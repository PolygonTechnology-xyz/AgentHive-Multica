import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditLogService } from './audit-log.service';
import { AuditLog } from './audit-log.entity';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let repo: any;
  let qb: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    qb = {
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[{ id: 'a1' }], 1]),
    };
    repo = {
      create: jest.fn((data) => data),
      save: jest.fn((data) => Promise.resolve(data)),
      createQueryBuilder: jest.fn(() => qb),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: getRepositoryToken(AuditLog), useValue: repo },
      ],
    }).compile();
    service = module.get<AuditLogService>(AuditLogService);
  });

  describe('write', () => {
    it('persists with default actorType=user when actorId set', async () => {
      await service.write({ actorId: 'u1', action: 'TEST' });
      expect(repo.save).toHaveBeenCalled();
      const arg = repo.create.mock.calls[0][0];
      expect(arg.actorType).toBe('user');
      expect(arg.action).toBe('TEST');
    });

    it('defaults actorType=anonymous when no actorId', async () => {
      await service.write({ action: 'ANON_ACTION' });
      const arg = repo.create.mock.calls[0][0];
      expect(arg.actorType).toBe('anonymous');
    });

    it('uses explicit actorType when provided', async () => {
      await service.write({ actorId: 'a', action: 'X', actorType: 'system' });
      const arg = repo.create.mock.calls[0][0];
      expect(arg.actorType).toBe('system');
    });

    it('swallows errors from save', async () => {
      repo.save.mockRejectedValue(new Error('db down'));
      await expect(service.write({ action: 'X' })).resolves.toBeUndefined();
    });

    it('forwards metadata + ipAddress', async () => {
      await service.write({ action: 'X', metadata: { k: 1 }, ipAddress: '1.2.3.4' });
      const arg = repo.create.mock.calls[0][0];
      expect(arg.metadata).toEqual({ k: 1 });
      expect(arg.ipAddress).toBe('1.2.3.4');
    });
  });

  describe('findAll', () => {
    it('returns items with default pagination', async () => {
      const result = await service.findAll({});
      expect(result.total).toBe(1);
      expect(qb.skip).toHaveBeenCalledWith(0);
      expect(qb.take).toHaveBeenCalledWith(50);
    });

    it('applies actor/resource/date filters', async () => {
      await service.findAll({
        page: 2,
        limit: 10,
        actorId: 'a',
        resourceType: 'user',
        resourceId: 'u1',
        since: new Date('2024-01-01'),
        until: new Date('2024-12-31'),
      });
      expect(qb.andWhere).toHaveBeenCalledTimes(5);
      expect(qb.skip).toHaveBeenCalledWith(10);
      expect(qb.take).toHaveBeenCalledWith(10);
    });

    it('omits filters when undefined', async () => {
      await service.findAll({ page: 1, limit: 5 });
      expect(qb.andWhere).not.toHaveBeenCalled();
    });
  });
});
