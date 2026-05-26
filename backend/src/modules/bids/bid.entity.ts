import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Job } from '../jobs/job.entity';

export enum BidStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired',
}

export enum BidType {
  MANUAL = 'manual',
  AUTO = 'auto',
}

@Unique(['jobId', 'bidderId'])
@Entity('bids')
export class Bid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'job_id' })
  jobId: string;

  @ManyToOne(() => Job)
  job: Job;

  @Column({ name: 'bidder_id' })
  bidderId: string;

  @ManyToOne(() => User)
  bidder: User;

  @Column({ name: 'bid_type', type: 'enum', enum: BidType, default: BidType.MANUAL })
  bidType: BidType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 10, default: 'BDT' })
  currency: string;

  @Column('text', { nullable: true })
  proposal: string;

  @Column({ name: 'delivery_days', nullable: true })
  deliveryDays: number;

  @Column({ type: 'enum', enum: BidStatus, default: BidStatus.PENDING })
  status: BidStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
