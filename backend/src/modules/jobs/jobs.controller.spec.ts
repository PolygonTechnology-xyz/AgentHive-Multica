import { Test, TestingModule } from '@nestjs/testing';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { BidsService } from '../bids/bids.service';

describe('JobsController', () => {
  let controller: JobsController;
  let jobsSvc: any;
  let bidsSvc: any;

  beforeEach(async () => {
    jobsSvc = {
      create: jest.fn().mockResolvedValue({ id: 'j' }),
      findAll: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      findByBuyer: jest.fn().mockResolvedValue([]),
      findForFreelancer: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      findById: jest.fn().mockResolvedValue({ id: 'j' }),
      update: jest.fn().mockResolvedValue({ id: 'j' }),
      cancel: jest.fn().mockResolvedValue({ id: 'j' }),
    };
    bidsSvc = {
      create: jest.fn().mockResolvedValue({ id: 'b' }),
      findByJob: jest.fn().mockResolvedValue([]),
      accept: jest.fn().mockResolvedValue({ id: 'b' }),
      reject: jest.fn().mockResolvedValue({ id: 'b' }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        { provide: JobsService, useValue: jobsSvc },
        { provide: BidsService, useValue: bidsSvc },
      ],
    }).compile();
    controller = module.get<JobsController>(JobsController);
  });

  it('delegates create', async () => {
    await controller.create({ id: 'u' } as any, {} as any);
    expect(jobsSvc.create).toHaveBeenCalledWith('u', {});
  });

  it('delegates findAll', async () => {
    await controller.findAll({} as any);
    expect(jobsSvc.findAll).toHaveBeenCalled();
  });

  it('delegates findMine', async () => {
    await controller.findMine({ id: 'u' } as any);
    expect(jobsSvc.findByBuyer).toHaveBeenCalledWith('u');
  });


  it('delegates findFreelancerJobs', async () => {
    await controller.findFreelancerJobs({ id: 'u' } as any, 'in_progress', 2, 10);
    expect(jobsSvc.findForFreelancer).toHaveBeenCalledWith('u', 'in_progress', 2, 10);
  });

  it('delegates findOne', async () => {
    await controller.findOne('j');
    expect(jobsSvc.findById).toHaveBeenCalledWith('j');
  });

  it('delegates update', async () => {
    await controller.update('j', { id: 'u' } as any, {} as any);
    expect(jobsSvc.update).toHaveBeenCalledWith('j', 'u', {});
  });

  it('delegates cancel', async () => {
    await controller.cancel('j', { id: 'u' } as any);
    expect(jobsSvc.cancel).toHaveBeenCalledWith('j', 'u');
  });

  it('delegates createBid', async () => {
    await controller.createBid('j', { id: 'u' } as any, {} as any);
    expect(bidsSvc.create).toHaveBeenCalledWith('j', 'u', {});
  });

  it('delegates getBids', async () => {
    await controller.getBids('j', { id: 'u', role: 'buyer' } as any);
    expect(bidsSvc.findByJob).toHaveBeenCalledWith('j', 'u', 'buyer');
  });

  it('delegates acceptBid', async () => {
    await controller.acceptBid('j', 'b', { id: 'u' } as any);
    expect(bidsSvc.accept).toHaveBeenCalledWith('j', 'b', 'u');
  });

  it('delegates rejectBid', async () => {
    await controller.rejectBid('j', 'b', { id: 'u' } as any);
    expect(bidsSvc.reject).toHaveBeenCalledWith('j', 'b', 'u');
  });
});
