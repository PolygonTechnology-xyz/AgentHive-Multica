import { Test, TestingModule } from '@nestjs/testing';
import { DisputesController } from './disputes.controller';
import { DisputesService } from './disputes.service';

describe('DisputesController', () => {
  let controller: DisputesController;
  let svc: any;

  beforeEach(async () => {
    svc = {
      fileDispute: jest.fn().mockResolvedValue({ id: 'd' }),
      findByUser: jest.fn().mockResolvedValue([]),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisputesController],
      providers: [{ provide: DisputesService, useValue: svc }],
    }).compile();
    controller = module.get<DisputesController>(DisputesController);
  });

  it('delegates fileDispute', async () => {
    await controller.fileDispute({ jobId: 'j', reason: 'r' } as any, { id: 'u' } as any);
    expect(svc.fileDispute).toHaveBeenCalled();
  });

  it('delegates mine', async () => {
    await controller.mine({ id: 'u' } as any);
    expect(svc.findByUser).toHaveBeenCalledWith('u');
  });
});
