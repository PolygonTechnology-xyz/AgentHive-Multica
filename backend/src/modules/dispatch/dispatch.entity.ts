import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Job } from '../jobs/job.entity';
import { Bid } from '../bids/bid.entity';

export enum DispatchStatus {
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  DELIVERED = 'delivered',
  REVISION = 'revision',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('dispatches')
export class Dispatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Job)
  job: Job;

  @Column({ name: 'job_id', unique: true })
  jobId: string;

  @ManyToOne(() => Bid)
  bid: Bid;

  @Column({ name: 'bid_id' })
  bidId: string;

  @Column({ name: 'freelancer_id' })
  freelancerId: string;

  @Column({ type: 'enum', enum: DispatchStatus, default: DispatchStatus.ASSIGNED })
  status: DispatchStatus;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt: Date;

  @Column({ name: 'started_at', nullable: true })
  startedAt: Date;

  @Column({ name: 'due_at', nullable: true })
  dueAt: Date;
}
