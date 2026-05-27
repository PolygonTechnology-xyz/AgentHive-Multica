import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bull';
import { AdminService } from './admin.service';
import { User, UserStatus } from '../users/user.entity';
import { Job } from '../jobs/job.entity';
import { Payment } from '../payments/payment.entity';
import { Dispute, DisputeStatus } from '../disputes/dispute.entity';
import { DisputesService } from '../disputes/disputes.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { BIDDER_QUEUE } from './admin.module';

describe('AdminService', () => {
  let service: AdminService;
  let userRepo: any;
  let jobRepo: any;
  let paymentRepo: any;
  let disputeRepo: any;
  let queue: any;
  let disputesSvc: any;
  let auditSvc: any;
  let userQB: any;
  let paymentQB: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    userQB = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[{ id: 'u1' }], 1]),
    };
    paymentQB = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ sum: '500.00' }),
    };
    userRepo = {
      createQueryBuilder: jest.fn(() => userQB),
      findOneOrFail: jest.fn(),
      update: jest.fn(),
      count: jest.fn().mockResolvedValue(10),
    };
    jobRepo = {
      findAndCount: jest.fn().mockResolvedValue([[{ id: 'j1' }], 1]),
      count: jest.fn().mockResolvedValue(5),
    };
    paymentRepo = {
      findAndCount: jest.fn().mockResolvedValue([[{ id: 'p1' }], 1]),
      createQueryBuilder: jest.fn(() => paymentQB),
    };
    disputeRepo = { count: jest.fn().mockResolvedValue(2) };
    queue = {
      getWaitingCount: jest.fn().mockResolvedValue(1),
      getActiveCount: jest.fn().mockResolvedValue(2),
      getFailedCount: jest.fn().mockResolvedValue(3),
      getDelayedCount: jest.fn().mockResolvedValue(0),
      getCompletedCount: jest.fn().mockResolvedValue(10),
      getFailed: jest.fn().mockResolvedValue([
        { id: 'f1', name: 'score-job', failedReason: 'oops', attemptsMade: 3, timestamp: 123 },
      ]),
    };
    disputesSvc = { findAll: jest.fn().mockResolvedValue({ items: [], total: 0 }), resolve: jest.fn() };
    auditSvc = { write: jest.fn(), findAll: jest.fn().mockResolvedValue({ items: [], total: 0 }) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Job), useValue: jobRepo },
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
        { provide: getRepositoryToken(Dispute), useValue: disputeRepo },
        { provide: getQueueToken(BIDDER_QUEUE), useValue: queue },
        { provide: DisputesService, useValue: disputesSvc },
        { provide: AuditLogService, useValue: auditSvc },
      ],
    }).compile();
    service = module.get<AdminService>(AdminService);
  });

  describe('listUsers', () => {
    it('returns users with no filters', async () => {
      const result = await service.listUsers();
      expect(result.total).toBe(1);
      expect(userQB.andWhere).not.toHaveBeenCalled();
    });

    it('applies role/status/search filters', async () => {
      await service.listUsers(1, 20, 'buyer', 'active', 'foo');
      expect(userQB.andWhere).toHaveBeenCalledTimes(3);
    });
  });

  describe('setUserStatus', () => {
    it('writes audit and returns updated user', async () => {
      userRepo.findOneOrFail
        .mockResolvedValueOnce({ id: 'u', status: UserStatus.ACTIVE })
        .mockResolvedValueOnce({ id: 'u', status: UserStatus.SUSPENDED });
      const result = await service.setUserStatus('u', UserStatus.SUSPENDED, 'admin');
      expect(auditSvc.write).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'ADMIN_SET_USER_STATUS', actorId: 'admin' }),
      );
      expect(result.status).toBe(UserStatus.SUSPENDED);
    });
  });

  describe('getUserView', () => {
    it('returns user', async () => {
      userRepo.findOneOrFail.mockResolvedValue({ id: 'u' });
      const result = await service.getUserView('u');
      expect(result.id).toBe('u');
    });
  });

  describe('listJobs', () => {
    it('lists jobs with no filter', async () => {
      const result = await service.listJobs();
      expect(result.total).toBe(1);
      expect(jobRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
    });
    it('lists jobs with status filter', async () => {
      await service.listJobs(1, 20, 'open');
      expect(jobRepo.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ where: { status: 'open' } }));
    });
  });

  describe('listPayments', () => {
    it('returns payments', async () => {
      const result = await service.listPayments();
      expect(result.total).toBe(1);
    });
  });

  describe('getStats', () => {
    it('aggregates all metrics', async () => {
      const result = await service.getStats();
      expect(result.userCount).toBe(10);
      expect(result.jobCount).toBe(5);
      expect(result.totalRevenue).toBe(500);
      expect(result.activeDisputes).toBe(2);
    });

    it('handles null sum gracefully', async () => {
      paymentQB.getRawOne.mockResolvedValue(null);
      const result = await service.getStats();
      expect(result.totalRevenue).toBe(0);
    });
  });

  describe('listDisputes', () => {
    it('delegates', async () => {
      await service.listDisputes(2, 5, DisputeStatus.OPEN);
      expect(disputesSvc.findAll).toHaveBeenCalledWith(2, 5, DisputeStatus.OPEN);
    });
  });

  describe('resolveDispute', () => {
    it('delegates', async () => {
      await service.resolveDispute('d', { outcome: 'buyer', resolution: 'r' } as any, 'admin');
      expect(disputesSvc.resolve).toHaveBeenCalled();
    });
  });

  describe('listAuditLogs', () => {
    it('passes through dates', async () => {
      await service.listAuditLogs({ since: '2024-01-01T00:00:00Z', until: '2024-12-31T00:00:00Z' });
      expect(auditSvc.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ since: expect.any(Date), until: expect.any(Date) }),
      );
    });

    it('passes through without dates', async () => {
      await service.listAuditLogs({ actorId: 'a' });
      expect(auditSvc.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ actorId: 'a', since: undefined, until: undefined }),
      );
    });
  });

  describe('getQueueHealth', () => {
    it('returns counts and recentFailed array', async () => {
      const result = await service.getQueueHealth();
      expect(result.counts.waiting).toBe(1);
      expect(result.recentFailed).toHaveLength(1);
      expect(result.recentFailed[0].id).toBe('f1');
    });

    it('returns empty failed array when none', async () => {
      queue.getFailedCount.mockResolvedValue(0);
      const result = await service.getQueueHealth();
      expect(result.recentFailed).toEqual([]);
    });
  });
});
