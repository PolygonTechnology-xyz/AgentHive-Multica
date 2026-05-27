import { Test, TestingModule } from '@nestjs/testing';
import { BidderAgentController } from './bidder-agent.controller';
import { BidderAgentService } from './bidder-agent.service';

describe('BidderAgentController', () => {
  let controller: BidderAgentController;
  let svc: any;

  beforeEach(async () => {
    svc = {
      findByUser: jest.fn().mockResolvedValue({ id: 'a' }),
      update: jest.fn().mockResolvedValue({ id: 'a' }),
      findBidHistory: jest.fn().mockResolvedValue([]),
      testScore: jest.fn().mockResolvedValue({ total: 80 }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BidderAgentController],
      providers: [{ provide: BidderAgentService, useValue: svc }],
    }).compile();
    controller = module.get<BidderAgentController>(BidderAgentController);
  });

  it('getMyAgent delegates', async () => {
    await controller.getMyAgent({ id: 'u' } as any);
    expect(svc.findByUser).toHaveBeenCalledWith('u');
  });

  it('updateMyAgent delegates', async () => {
    await controller.updateMyAgent({ id: 'u' } as any, {} as any);
    expect(svc.update).toHaveBeenCalledWith('u', {});
  });

  it('getBidHistory delegates', async () => {
    await controller.getBidHistory({ id: 'u' } as any);
    expect(svc.findBidHistory).toHaveBeenCalledWith('u');
  });

  it('testScore delegates', async () => {
    await controller.testScore({ id: 'u' } as any, { title: 't', description: 'd' } as any);
    expect(svc.testScore).toHaveBeenCalled();
  });
});
