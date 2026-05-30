import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { Notification } from './notification.entity';
import { User } from '../users/user.entity';
import { Job } from '../jobs/job.entity';
import { Bid } from '../bids/bid.entity';
import { Dispatch } from '../dispatch/dispatch.entity';
import { Payment, PaymentStatus } from '../payments/payment.entity';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notifRepo: any;
  let config: any;
  let userRepo: any;
  let jobRepo: any;
  let bidRepo: any;
  let dispatchRepo: any;
  let paymentRepo: any;
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
    userRepo = { findOne: jest.fn() };
    jobRepo = { findOne: jest.fn() };
    bidRepo = { findOne: jest.fn() };
    dispatchRepo = { findOne: jest.fn() };
    paymentRepo = { findOne: jest.fn() };
    config = { get: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: notifRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Job), useValue: jobRepo },
        { provide: getRepositoryToken(Bid), useValue: bidRepo },
        { provide: getRepositoryToken(Dispatch), useValue: dispatchRepo },
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();
    service = module.get<NotificationsService>(NotificationsService);
  });

  describe('notify', () => {
    it('saves a notification without sending email when sendEmail=false', async () => {
      const result = await service.notify({ userId: 'u', type: 't', title: 'T', body: 'b' });
      expect(notifRepo.save).toHaveBeenCalled();
      expect(result.userId).toBe('u');
    });


    it('publishes saved notifications to SSE subscribers', async () => {
      const received: Notification[] = [];
      const subscription = service.streamForUser('u').subscribe((message) => received.push(message.data));
      await service.notify({ userId: 'u', type: 't', title: 'T', body: 'b' });
      expect(received).toHaveLength(1);
      subscription.unsubscribe();
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
    it('notifies buyer when a bid is placed', async () => {
      userRepo.findOne
        .mockResolvedValueOnce({ id: 'buyer', email: 'buyer@example.com' })
        .mockResolvedValueOnce({ id: 'freelancer', displayName: 'Free' });
      jobRepo.findOne.mockResolvedValue({ id: 'job', title: 'Build API' });
      await service.onBidPlaced({ bidId: 'bid', jobId: 'job', buyerId: 'buyer', bidderId: 'freelancer' });
      expect(notifRepo.save).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'buyer',
        type: 'bid.placed',
      }));
    });

    it('notifies freelancer when a bid is accepted', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'freelancer', email: 'free@example.com' });
      jobRepo.findOne.mockResolvedValue({ id: 'job', title: 'Build API' });
      await service.onBidAccepted({ bidId: 'bid', jobId: 'job', buyerId: 'buyer', bidderId: 'freelancer' });
      expect(notifRepo.save).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'freelancer',
        type: 'bid.won',
      }));
    });

    it('notifies buyer on delivery.submitted', async () => {
      dispatchRepo.findOne.mockResolvedValue({ id: 'd', jobId: 'j', freelancerId: 'f' });
      jobRepo.findOne.mockResolvedValue({ id: 'j', title: 'Build API', buyerId: 'b' });
      userRepo.findOne
        .mockResolvedValueOnce({ id: 'b', email: 'buyer@example.com' })
        .mockResolvedValueOnce({ id: 'f', email: 'free@example.com' });
      await service.onDeliverySubmitted({ dispatchId: 'd', jobId: 'j' });
      expect(notifRepo.save).toHaveBeenCalledWith(expect.objectContaining({ type: 'job.delivered' }));
    });

    it('notifies freelancer on revision request', async () => {
      dispatchRepo.findOne.mockResolvedValue({ id: 'd', jobId: 'j', freelancerId: 'f' });
      jobRepo.findOne.mockResolvedValue({ id: 'j', title: 'Build API', buyerId: 'b' });
      userRepo.findOne
        .mockResolvedValueOnce({ id: 'b', email: 'buyer@example.com' })
        .mockResolvedValueOnce({ id: 'f', email: 'free@example.com' });
      await service.onRevisionRequested({ dispatchId: 'd', jobId: 'j', reason: 'Fix copy' });
      expect(notifRepo.save).toHaveBeenCalledWith(expect.objectContaining({ type: 'revision.requested' }));
    });

    it('notifies both parties when payment is confirmed', async () => {
      paymentRepo.findOne.mockResolvedValue({
        id: 'p',
        jobId: 'j',
        buyerId: 'b',
        freelancerId: 'f',
        status: PaymentStatus.HELD,
      });
      jobRepo.findOne.mockResolvedValue({ id: 'j', title: 'Build API' });
      userRepo.findOne
        .mockResolvedValueOnce({ id: 'b', email: 'buyer@example.com' })
        .mockResolvedValueOnce({ id: 'f', email: 'free@example.com' });
      await service.onPaymentConfirmed({ paymentId: 'p', jobId: 'j' });
      expect(notifRepo.save).toHaveBeenCalledTimes(2);
      expect(notifRepo.save).toHaveBeenCalledWith(expect.objectContaining({ type: 'payment.confirmed' }));
    });

    it('notifies freelancer when payout is confirmed', async () => {
      paymentRepo.findOne.mockResolvedValue({ id: 'p', jobId: 'j', buyerId: 'b', freelancerId: 'f' });
      jobRepo.findOne.mockResolvedValue({ id: 'j', title: 'Build API' });
      userRepo.findOne
        .mockResolvedValueOnce({ id: 'b', email: 'buyer@example.com' })
        .mockResolvedValueOnce({ id: 'f', email: 'free@example.com' });
      await service.onPaymentReleased({ paymentId: 'p', jobId: 'j' });
      expect(notifRepo.save).toHaveBeenCalledWith(expect.objectContaining({ type: 'payout.confirmed' }));
    });
  });
});
