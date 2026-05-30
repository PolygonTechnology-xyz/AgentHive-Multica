import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let svc: any;

  beforeEach(async () => {
    svc = {
      findByUser: jest.fn().mockResolvedValue([]),
      findFreelancerPayouts: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      fundEscrow: jest.fn().mockResolvedValue({
        payment: { id: 'p', ppayReference: 'PID' },
        redirectUrl: 'http://gateway/page',
      }),
      queryAndReconcile: jest.fn().mockResolvedValue({ id: 'p' }),
      release: jest.fn().mockResolvedValue({ id: 'p' }),
      refund: jest.fn().mockResolvedValue({ id: 'p' }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useValue: svc }],
    }).compile();
    controller = module.get<PaymentsController>(PaymentsController);
  });


  it('delegates freelancerPayouts', async () => {
    await controller.freelancerPayouts({ id: 'u' } as any, 2, 10);
    expect(svc.findFreelancerPayouts).toHaveBeenCalledWith('u', 2, 10);
  });

  it('delegates history', async () => {
    await controller.history({ id: 'u' } as any);
    expect(svc.findByUser).toHaveBeenCalledWith('u');
  });

  it('fundEscrow returns paymentId + redirectUrl', async () => {
    const result = await controller.fundEscrow(
      { id: 'u' } as any,
      { jobId: 'j', idempotencyKey: 'k' } as any,
    );
    expect(svc.fundEscrow).toHaveBeenCalledWith('u', 'j', 'k');
    expect(result).toEqual({ paymentId: 'p', ppayReference: 'PID', redirectUrl: 'http://gateway/page' });
  });

  it('delegates reconcile', async () => {
    await controller.reconcile({ id: 'u' } as any, 'p');
    expect(svc.queryAndReconcile).toHaveBeenCalledWith('p');
  });

  it('delegates release', async () => {
    await controller.release({ id: 'u' } as any, 'p');
    expect(svc.release).toHaveBeenCalledWith('p', 'u');
  });

  it('delegates refund', async () => {
    await controller.refund({ id: 'u' } as any, 'p');
    expect(svc.refund).toHaveBeenCalledWith('p', 'u');
  });
});
