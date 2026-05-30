import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let svc: any;

  beforeEach(async () => {
    svc = {
      findByUser: jest.fn().mockResolvedValue({ items: [], total: 0, unreadCount: 0 }),
      markRead: jest.fn().mockResolvedValue(undefined),
      markAllRead: jest.fn().mockResolvedValue(undefined),
      streamForUser: jest.fn().mockReturnValue('stream'),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: svc }],
    }).compile();
    controller = module.get<NotificationsController>(NotificationsController);
  });


  it('delegates stream', () => {
    const result = controller.stream({ id: 'u' } as any);
    expect(result).toBe('stream');
    expect(svc.streamForUser).toHaveBeenCalledWith('u');
  });

  it('delegates findAll', async () => {
    await controller.findAll({ id: 'u' } as any, 1, 20);
    expect(svc.findByUser).toHaveBeenCalledWith('u', 1, 20);
  });

  it('delegates markRead', async () => {
    await controller.markRead('n', { id: 'u' } as any);
    expect(svc.markRead).toHaveBeenCalledWith('n', 'u');
  });

  it('delegates markAllRead', async () => {
    await controller.markAllRead({ id: 'u' } as any);
    expect(svc.markAllRead).toHaveBeenCalledWith('u');
  });
});
