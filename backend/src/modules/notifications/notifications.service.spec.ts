import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { Notification } from './notification.entity';
import { User } from '../users/user.entity';
import { Job } from '../jobs/job.entity';
import { Dispatch } from '../dispatch/dispatch.entity';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notifRepo: any;
  let config: any;
  let userRepo: any;
  let jobRepo: any;
  let dispatchRepo: any;
  let updateQB: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    updateQB = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({}),
    };
    notifRepo = {
      findOne: jest.fn(),
      findAndCount: jest.fn().mockResolvedValue([[{ id: 'n1' }], 1]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn((d) => d),
      save: jest.fn((d) => Promise.resolve(d)),
      update: jest.fn(),
      createQueryBuilder: jest.fn(() => updateQB),
    };
    config = { get: jest.fn() };
    userRepo = { findOne: jest.fn() };
    jobRepo = { findOne: jest.fn() };
    dispatchRepo = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: notifRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Job), useValue: jobRepo },
        { provide: getRepositoryToken(Dispatch), useValue: dispatchRepo },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();
    service = module.get<NotificationsService>(NotificationsService);
  });

  describe('notify', () => {
    it('saves a notification without sending email when sendEmail=false', async () => {
      await service.notify({ userId: 'u', type: 't', title: 'T', body: 'b' });
      expect(notifRepo.save).toHaveBeenCalled();
    });

    it('skips email when no API key in config (dev mode)', async () => {
      config.get.mockReturnValue(undefined);
      await service.notify({ userId: 'u', type: 't', title: 'T', body: 'b', sendEmail: true, emailTo: 'a@b.com' });
      expect(notifRepo.save).toHaveBeenCalled();
    });

    it('does not call email when sendEmail=true but emailTo missing', async () => {
      await service.notify({ userId: 'u', type: 't', title: 'T', body: 'b', sendEmail: true });
      expect(notifRepo.save).toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('returns items with unread count', async () => {
      notifRepo.count.mockResolvedValue(3);
      const result = await service.findByUser('u');
      expect(result.items).toHaveLength(1);
      expect(result.unreadCount).toBe(3);
      expect(result.total).toBe(1);
    });

    it('honors custom pagination', async () => {
      await service.findByUser('u', 2, 5);
      expect(notifRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 }),
      );
    });
  });

  describe('markRead', () => {
    it('throws NotFoundException when missing', async () => {
      notifRepo.findOne.mockResolvedValue(null);
      await expect(service.markRead('n', 'u')).rejects.toThrow(NotFoundException);
    });

    it('marks as read', async () => {
      notifRepo.findOne.mockResolvedValue({ id: 'n', userId: 'u' });
      await service.markRead('n', 'u');
      expect(notifRepo.update).toHaveBeenCalledWith('n', expect.objectContaining({ readAt: expect.any(Date) }));
    });
  });

  describe('markAllRead', () => {
    it('runs a bulk update', async () => {
      await service.markAllRead('u');
      expect(updateQB.execute).toHaveBeenCalled();
      expect(updateQB.where).toHaveBeenCalledWith(expect.stringContaining('user_id'), { userId: 'u' });
    });
  });

  describe('event listeners', () => {
    it('notifies buyer on delivery.submitted', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j', buyerId: 'buyer', title: 'Job title' });
      userRepo.findOne.mockResolvedValue({ id: 'buyer', email: 'buyer@example.com' });
      await service.onDeliverySubmitted({ dispatchId: 'dp', deliveryId: 'd', jobId: 'j', buyerId: 'buyer', revisionRound: 2 });
      expect(notifRepo.save).toHaveBeenCalledWith(expect.objectContaining({ userId: 'buyer', type: 'delivery.submitted' }));
    });
    it('notifies freelancer on delivery.revision-requested', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'free', email: 'free@example.com' });
      await service.onDeliveryRevisionRequested({ dispatchId: 'dp', deliveryId: 'd', jobId: 'j', freelancerId: 'free', reason: 'Please improve the copy.' });
      expect(notifRepo.save).toHaveBeenCalledWith(expect.objectContaining({ userId: 'free', type: 'delivery.revision-requested' }));
    });

    it('logs on delivery.approved', async () => {
      await expect(service.onDeliveryApproved({ jobId: 'j' })).resolves.toBeUndefined();
    });
    it('logs on payment.released', async () => {
      await expect(service.onPaymentReleased({ jobId: 'j' })).resolves.toBeUndefined();
    });
  });
});
