import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum BidderAgentStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  DISABLED = 'disabled',
}

@Entity('bidder_agents')
export class BidderAgent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @Column({ type: 'enum', enum: BidderAgentStatus, default: BidderAgentStatus.ACTIVE })
  status: BidderAgentStatus;

  @Column({ name: 'nl_config', type: 'text', nullable: true })
  nlConfig: string;

  @Column({ name: 'scoring_rules', type: 'json', nullable: true })
  scoringRules: {
    preferredCategories?: string[];
    preferredSkills?: string[];
    budgetMin?: number;
    budgetMax?: number;
    keywords?: string[];
  };

  @Column({
    name: 'bid_threshold',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 70,
  })
  bidThreshold: number;

  @Column({ name: 'max_bid_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxBidAmount: number;

  @Column({ name: 'auto_bid_enabled', default: true })
  autoBidEnabled: boolean;

  @CreateDateColumn({ name: 'provisioned_at' })
  provisionedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
