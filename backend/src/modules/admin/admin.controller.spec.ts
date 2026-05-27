import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserStatus } from '../users/user.entity';
import { Reflector } from '@nestjs/core';

describe('AdminController', () => {
  let controller: AdminController;
  let svc: any;

  beforeEach(async () => {
    svc = {
      listUsers: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      setUserStatus: jest.fn().mockResolvedValue({ id: 'u' }),
      getUserView: jest.fn().mockResolvedValue({ id: 'u' }),
      listJobs: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      listPayments: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      getStats: jest.fn().mockResolvedValue({}),
      listDisputes: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      resolveDispute: jest.fn().mockResolvedValue({ id: 'd' }),
      getQueueHealth: jest.fn().mockResolvedValue({}),
      listAuditLogs: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: svc },
        Reflector,
      ],
    }).compile();
    controller = module.get<AdminController>(AdminController);
  });

  it('delegates listUsers', async () => {
    await controller.listUsers(1, 20, 'buyer', 'active', 's');
    expect(svc.listUsers).toHaveBeenCalledWith(1, 20, 'buyer', 'active', 's');
  });

  it('delegates setUserStatus', async () => {
    await controller.setUserStatus('u', UserStatus.SUSPENDED, { id: 'a' } as any);
    expect(svc.setUserStatus).toHaveBeenCalledWith('u', UserStatus.SUSPENDED, 'a');
  });

  it('delegates getUserView', async () => {
    await controller.getUserView('u');
    expect(svc.getUserView).toHaveBeenCalledWith('u');
  });

  it('delegates listJobs', async () => {
    await controller.listJobs(1, 20, 'open');
    expect(svc.listJobs).toHaveBeenCalledWith(1, 20, 'open');
  });

  it('delegates listPayments', async () => {
    await controller.listPayments(1, 20);
    expect(svc.listPayments).toHaveBeenCalledWith(1, 20);
  });

  it('delegates getStats', async () => {
    await controller.getStats();
    expect(svc.getStats).toHaveBeenCalled();
  });

  it('delegates listDisputes', async () => {
    await controller.listDisputes(1, 10);
    expect(svc.listDisputes).toHaveBeenCalled();
  });

  it('delegates resolveDispute', async () => {
    await controller.resolveDispute('d', { outcome: 'buyer', resolution: 'r' } as any, { id: 'a' } as any);
    expect(svc.resolveDispute).toHaveBeenCalled();
  });

  it('delegates getQueueHealth', async () => {
    await controller.getQueueHealth();
    expect(svc.getQueueHealth).toHaveBeenCalled();
  });

  it('delegates listAuditLogs', async () => {
    await controller.listAuditLogs(1, 50, 'a', 'user', 'r');
    expect(svc.listAuditLogs).toHaveBeenCalled();
  });
});
