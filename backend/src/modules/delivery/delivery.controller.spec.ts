import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';

describe('DeliveryController', () => {
  let controller: DeliveryController;
  let svc: any;

  beforeEach(async () => {
    svc = {
      submit: jest.fn().mockResolvedValue({ id: 'd' }),
      requestRevision: jest.fn().mockResolvedValue(undefined),
      approve: jest.fn().mockResolvedValue(undefined),
      findByDispatch: jest.fn().mockResolvedValue([]),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryController],
      providers: [{ provide: DeliveryService, useValue: svc }],
    }).compile();
    controller = module.get<DeliveryController>(DeliveryController);
  });

  it('delegates submit', async () => {
    await controller.submit('dp', { id: 'u' } as any, {} as any);
    expect(svc.submit).toHaveBeenCalledWith('dp', 'u', {});
  });

  it('delegates requestRevision', async () => {
    await controller.requestRevision('d', { id: 'u' } as any, { reason: 'r' } as any);
    expect(svc.requestRevision).toHaveBeenCalledWith('d', 'u', 'r');
  });

  it('delegates approve', async () => {
    await controller.approve('d', { id: 'u' } as any);
    expect(svc.approve).toHaveBeenCalledWith('d', 'u');
  });

  it('delegates findByDispatch', async () => {
    await controller.findByDispatch('dp');
    expect(svc.findByDispatch).toHaveBeenCalledWith('dp');
  });
});
