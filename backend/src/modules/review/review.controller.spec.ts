import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';

describe('ReviewController', () => {
  let controller: ReviewController;
  let svc: any;

  beforeEach(async () => {
    svc = {
      create: jest.fn().mockResolvedValue({ id: 'r' }),
      findByUser: jest.fn().mockResolvedValue({ reviews: [], avgRating: 0 }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewController],
      providers: [{ provide: ReviewService, useValue: svc }],
    }).compile();
    controller = module.get<ReviewController>(ReviewController);
  });

  it('delegates create', async () => {
    await controller.create('j', { id: 'u' } as any, { revieweeId: 'r', rating: 5, comment: 'c' } as any);
    expect(svc.create).toHaveBeenCalledWith('j', 'u', 'r', 5, 'c');
  });

  it('delegates findByUser', async () => {
    await controller.findByUser('u');
    expect(svc.findByUser).toHaveBeenCalledWith('u');
  });
});
