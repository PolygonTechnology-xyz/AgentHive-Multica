import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';
import { Job, JobStatus } from '../jobs/job.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(Job) private jobRepo: Repository<Job>,
  ) {}

  async create(
    jobId: string,
    reviewerId: string,
    revieweeId: string,
    rating: number,
    comment?: string,
  ): Promise<Review> {
    if (rating < 1 || rating > 5) throw new BadRequestException('Rating must be 1-5');

    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.status !== JobStatus.COMPLETED) {
      throw new BadRequestException('Job must be completed before review');
    }

    const existing = await this.reviewRepo.findOne({ where: { jobId, reviewerId } });
    if (existing) throw new ConflictException('Already reviewed this job');

    return this.reviewRepo.save(
      this.reviewRepo.create({
        id: uuidv4(),
        jobId,
        reviewerId,
        revieweeId,
        rating,
        comment,
      }),
    );
  }

  async findByUser(userId: string): Promise<{ reviews: Review[]; avgRating: number }> {
    const reviews = await this.reviewRepo.find({
      where: { revieweeId: userId },
      order: { createdAt: 'DESC' },
    });

    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return { reviews, avgRating: Math.round(avgRating * 10) / 10 };
  }
}
