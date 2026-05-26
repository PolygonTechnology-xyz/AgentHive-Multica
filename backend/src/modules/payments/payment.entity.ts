import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Job } from '../jobs/job.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  HELD = 'held',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Job)
  job: Job;

  @Column({ name: 'job_id', unique: true })
  jobId: string;

  @Column({ name: 'buyer_id' })
  buyerId: string;

  @Column({ name: 'freelancer_id' })
  freelancerId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'platform_fee', type: 'decimal', precision: 10, scale: 2 })
  platformFee: number;

  @Column({ length: 10, default: 'BDT' })
  currency: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ name: 'ppay_reference', length: 255, nullable: true })
  ppayReference: string;

  @Column({ name: 'ppay_transaction_id', length: 255, nullable: true })
  ppayTransactionId: string;

  @Column({ name: 'idempotency_key', length: 255, nullable: true, unique: true })
  idempotencyKey: string;

  @Column({ name: 'held_at', nullable: true })
  heldAt: Date;

  @Column({ name: 'released_at', nullable: true })
  releasedAt: Date;

  @Column({ name: 'refunded_at', nullable: true })
  refundedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
