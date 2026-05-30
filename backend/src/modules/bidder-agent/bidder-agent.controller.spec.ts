import { Test, TestingModule } from '@nestjs/testing';
import { BidderAgentController } from './bidder-agent.controller';
import { BidderAgentService } from './bidder-agent.service';

describe('BidderAgentController', () => {
  let controller: BidderAgentController;
  let svc: any;

  beforeEach(async () => {
    svc = {
      findList: jest.fn().mockResolvedValue([{ id: 'a' }]),
      findByUser: jest.fn().mockResolvedValue({ id: 'a' }),
      update: jest.fn().mockResolvedValue({ id: 'a' }),
      updateById: jest.fn().mockResolvedValue({ id: 'a' }),
      pause: jest.fn().mockResolvedValue({ id: 'a' }),
      resume: jest.fn().mockResolvedValue({ id: 'a' }),
      findBidHistory: jest.fn().mockResolvedValue([]),
      testScore: jest.fn().mockResolvedValue({ total: 80 }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BidderAgentController],
      providers: [{ provide: BidderAgentService, useValue: svc }],
    }).compile();
    controller = module.get<BidderAgentController>(BidderAgentController);
  });


  it('listAgents delegates', async () => {
    await controller.listAgents({ id: 'u' } as any);
    expect(svc.findList).toHaveBeenCalledWith('u');
  });

  it('getMyAgent delegates', async () => {
    await controller.getMyAgent({ id: 'u' } as any);
    expect(svc.findByUser).toHaveBeenCalledWith('u');
  });

  it('updateMyAgent delegates', async () => {
    await controller.updateMyAgent({ id: 'u' } as any, {} as any);
    expect(svc.update).toHaveBeenCalledWith('u', {});
  });


  it('updateAgentById delegates', async () => {
    await controller.updateAgentById('a', { id: 'u' } as any, { scoreThreshold: 80 } as any);
    expect(svc.updateById).toHaveBeenCalledWith('u', 'a', { scoreThreshold: 80 });
  });

  it('pauseAgent and resumeAgent delegate', async () => {
    await controller.pauseAgent('a', { id: 'u' } as any);
    await controller.resumeAgent('a', { id: 'u' } as any);
    expect(svc.pause).toHaveBeenCalledWith('u', 'a');
    expect(svc.resume).toHaveBeenCalledWith('u', 'a');
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
