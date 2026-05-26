import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Dispatch } from '../dispatch/dispatch.entity';

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Dispatch)
  dispatch: Dispatch;

  @Column({ name: 'dispatch_id' })
  dispatchId: string;

  @Column({ name: 'submitted_by' })
  submittedBy: string;

  @Column('text', { nullable: true })
  message: string;

  @Column({ type: 'json', nullable: true })
  attachments: { name: string; url: string }[];

  @Column({ name: 'revision_round', default: 0 })
  revisionRound: number;

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;
}
