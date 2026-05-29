import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Job } from '../jobs/job.entity';

@Unique(['jobId', 'reviewerId'])
@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Job)
  job: Job;

  @Column({ name: 'job_id' })
  jobId: string;

  @Column({ name: 'reviewer_id' })
  reviewerId: string;

  @Column({ name: 'reviewee_id' })
  revieweeId: string;

  @Column({ type: 'smallint' })
  rating: number;

  @Column('text', { nullable: true })
  comment: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
