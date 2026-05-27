import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReviewService } from './review.service';
import { Review } from './review.entity';
import { Job, JobStatus } from '../jobs/job.entity';

describe('ReviewService', () => {
  let service: ReviewService;
  let reviewRepo: any;
  let jobRepo: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    reviewRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((d) => d),
      save: jest.fn((d) => Promise.resolve(d)),
    };
    jobRepo = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        { provide: getRepositoryToken(Review), useValue: reviewRepo },
        { provide: getRepositoryToken(Job), useValue: jobRepo },
      ],
    }).compile();
    service = module.get<ReviewService>(ReviewService);
  });

  describe('create', () => {
    it('throws BadRequestException on rating < 1', async () => {
      await expect(service.create('j', 'r', 'rv', 0)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException on rating > 5', async () => {
      await expect(service.create('j', 'r', 'rv', 6)).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when job missing', async () => {
      jobRepo.findOne.mockResolvedValue(null);
      await expect(service.create('j', 'r', 'rv', 5)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when job not COMPLETED', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j', status: JobStatus.IN_PROGRESS });
      await expect(service.create('j', 'r', 'rv', 5)).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException when already reviewed', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j', status: JobStatus.COMPLETED });
      reviewRepo.findOne.mockResolvedValue({ id: 'r1' });
      await expect(service.create('j', 'r', 'rv', 5)).rejects.toThrow(ConflictException);
    });

    it('creates new review on happy path', async () => {
      jobRepo.findOne.mockResolvedValue({ id: 'j', status: JobStatus.COMPLETED });
      reviewRepo.findOne.mockResolvedValue(null);
      const review: any = await service.create('j', 'r', 'rv', 5, 'great');
      expect(review.rating).toBe(5);
      expect(review.comment).toBe('great');
    });
  });

  describe('findByUser', () => {
    it('returns empty list with avg=0 when no reviews', async () => {
      reviewRepo.find.mockResolvedValue([]);
      const result = await service.findByUser('u');
      expect(result.avgRating).toBe(0);
      expect(result.reviews).toEqual([]);
    });

    it('computes avgRating rounded to 1 decimal', async () => {
      reviewRepo.find.mockResolvedValue([
        { rating: 5 },
        { rating: 4 },
        { rating: 4 },
      ]);
      const result = await service.findByUser('u');
      expect(result.avgRating).toBe(4.3);
    });
  });
});
