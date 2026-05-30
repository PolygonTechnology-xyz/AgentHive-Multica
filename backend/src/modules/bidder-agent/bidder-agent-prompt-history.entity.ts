import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BidderAgent } from './bidder-agent.entity';

@Entity('bidder_agent_prompt_history')
export class BidderAgentPromptHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BidderAgent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agent_id' })
  agent: BidderAgent;

  @Column({ name: 'agent_id' })
  agentId: string;

  @Column({ name: 'nl_config', type: 'text' })
  nlConfig: string;

  @Column({ name: 'parsed_rules', type: 'json', nullable: true })
  parsedRules: BidderAgent['scoringRules'];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
