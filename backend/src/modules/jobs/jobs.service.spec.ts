import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JobsService } from './jobs.service';
import { Job, JobStatus } from './job.entity';
import { FilterJobsDto } from './dto/filter-jobs.dto';

describe('JobsService', () => {
  let service: JobsService;
  let jobRepo: any;
  let emitter: any;
  let qb: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    qb = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[{ id: 'j1' }], 1]),
    };
    jobRepo = {
      create: jest.fn((d) => d),
      save: jest.fn((d) => Promise.resolve(d)),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(() => qb),
    };
    emitter = { emit: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: getRepositoryToken(Job), useValue: jobRepo },
        { provide: EventEmitter2, useValue: emitter },
      ],
    }).compile();
    service = module.get<JobsService>(JobsService);
  });

  describe('create', () => {
    it('saves a job and emits job.posted', async () => {
      const dto: any = {
        title: 't',
        description: 'd',
        category: 'web',
        skillsRequired: ['react'],
        budgetMin: 10,
        budgetMax: 100,
        deadline: '2026-06-01T00:00:00Z',
      };
      const job = await service.create('buyer1', dto);
      expect(job.buyerId).toBe('buyer1');
      expect(emitter.emit).toHaveBeenCalledWith('job.posted', expect.objectContaining({ job }));
    });

    it('omits deadline when not provided', async () => {
      const job = await service.create('b', { title: 't', description: 'd' } as any);
      expect(job.deadline).toBeUndefined();
    });
  });

  describe('findAll', () => {
    const baseFilter = (): FilterJobsDto => {
      const f = new FilterJobsDto();
      return f;
    };

    it('paginates results with no filters', async () => {
      const result = await service.findAll(baseFilter());
      expect(result.meta.total).toBe(1);
      expect(result.data).toHaveLength(1);
    });

    it('applies search filter', async () => {
      const f = baseFilter();
      (f as any).search = 'foo';
      await service.findAll(f);
      expect(qb.andWhere).toHaveBeenCalledWith(expect.stringContaining('LIKE :search'), expect.any(Object));
    });

    it('applies category, budget and skills filters', async () => {
      const f = baseFilter();
      (f as any).category = 'web';
      (f as any).budgetMin = 100;
      (f as any).budgetMax = 1000;
      (f as any).skills = 'react,typescript';
      await service.findAll(f);
      expect(qb.andWhere).toHaveBeenCalledTimes(4);
    });
  });

  describe('findById', () => {
    it('returns job when found', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j1' });
      const job = await service.findById('j1');
      expect(job.id).toBe('j1');
    });
    it('throws NotFoundException when missing', async () => {
      jobRepo.findOne.mockResolvedValue(null);
      await expect(service.findById('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByBuyer', () => {
    it('returns buyer jobs', async () => {
      jobRepo.find.mockResolvedValue([{ id: 'j1' }]);
      const jobs = await service.findByBuyer('b1');
      expect(jobs).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('throws ForbiddenException if not owner', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j1', buyerId: 'other', status: JobStatus.OPEN });
      await expect(service.update('j1', 'me', {})).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException if not OPEN/DRAFT', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j1', buyerId: 'me', status: JobStatus.DISPATCHED });
      await expect(service.update('j1', 'me', {})).rejects.toThrow(BadRequestException);
    });

    it('updates fields and persists', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j1', buyerId: 'me', status: JobStatus.OPEN, title: 'old' });
      const result: any = await service.update('j1', 'me', { title: 'new', deadline: '2026-12-31T00:00:00Z' } as any);
      expect(result.title).toBe('new');
      expect(result.deadline).toBeInstanceOf(Date);
    });

    it('keeps existing values when not provided', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j1', buyerId: 'me', status: JobStatus.OPEN, title: 'keep', description: 'd' });
      const result: any = await service.update('j1', 'me', {});
      expect(result.title).toBe('keep');
    });
  });

  describe('cancel', () => {
    it('throws ForbiddenException if not owner', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j1', buyerId: 'other', status: JobStatus.OPEN });
      await expect(service.cancel('j1', 'me')).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException if in progress', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j1', buyerId: 'me', status: JobStatus.IN_PROGRESS });
      await expect(service.cancel('j1', 'me')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when DISPATCHED', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j1', buyerId: 'me', status: JobStatus.DISPATCHED });
      await expect(service.cancel('j1', 'me')).rejects.toThrow(BadRequestException);
    });

    it('sets status to CANCELLED', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j1', buyerId: 'me', status: JobStatus.OPEN });
      const result: any = await service.cancel('j1', 'me');
      expect(result.status).toBe(JobStatus.CANCELLED);
    });
  });

  describe('updateStatus', () => {
    it('calls repo.update', async () => {
      await service.updateStatus('j1', JobStatus.COMPLETED);
      expect(jobRepo.update).toHaveBeenCalledWith('j1', { status: JobStatus.COMPLETED });
    });
  });
});
