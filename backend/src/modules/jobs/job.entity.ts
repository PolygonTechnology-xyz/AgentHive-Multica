import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum JobStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  IN_BIDDING = 'in_bidding',
  DISPATCHED = 'dispatched',
  IN_PROGRESS = 'in_progress',
  DELIVERED = 'delivered',
  REVISION = 'revision',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  buyer: User;

  @Column({ name: 'buyer_id' })
  buyerId: string;

  @Column({ length: 500 })
  title: string;

  @Column('text')
  description: string;

  @Index()
  @Column({ length: 100, nullable: true })
  category: string;

  @Column({ name: 'skills_required', type: 'json', nullable: true })
  skillsRequired: string[];

  @Column({ name: 'budget_min', type: 'decimal', precision: 10, scale: 2, nullable: true })
  budgetMin: number;

  @Column({ name: 'budget_max', type: 'decimal', precision: 10, scale: 2, nullable: true })
  budgetMax: number;

  @Column({ length: 10, default: 'BDT' })
  currency: string;

  @Column({ name: 'deadline', nullable: true })
  deadline: Date;

  @Index()
  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.OPEN })
  status: JobStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
