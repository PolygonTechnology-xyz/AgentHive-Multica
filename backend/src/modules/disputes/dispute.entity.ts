import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Job } from '../jobs/job.entity';
import { User } from '../users/user.entity';

export enum DisputeStatus {
  OPEN = 'open',
  RESOLVED_BUYER = 'resolved_buyer',
  RESOLVED_FREELANCER = 'resolved_freelancer',
  RESOLVED_PARTIAL = 'resolved_partial',
  WITHDRAWN = 'withdrawn',
}

@Entity('disputes')
export class Dispute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'job_id' })
  jobId: string;

  @ManyToOne(() => Job)
  job: Job;

  @Column({ name: 'filed_by_id' })
  filedById: string;

  @ManyToOne(() => User)
  filedBy: User;

  @Column('text')
  reason: string;

  @Index()
  @Column({ type: 'enum', enum: DisputeStatus, default: DisputeStatus.OPEN })
  status: DisputeStatus;

  @Column('text', { nullable: true })
  resolution: string;

  @Column({ name: 'resolved_by_id', nullable: true })
  resolvedById: string;

  @Column({ name: 'buyer_refund_percent', type: 'decimal', precision: 5, scale: 2, nullable: true })
  buyerRefundPercent: number;

  @Column({ name: 'payment_id', nullable: true })
  paymentId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
