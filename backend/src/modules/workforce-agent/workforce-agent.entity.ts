import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum WorkforceAgentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REMOVED = 'REMOVED',
}

@Entity('workforce_agents')
export class WorkforceAgent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 128 })
  name: string;

  @Column({ name: 'skill_index', type: 'json' })
  skillIndex: string[];

  @Column({ type: 'enum', enum: WorkforceAgentStatus, default: WorkforceAgentStatus.ACTIVE })
  status: WorkforceAgentStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
