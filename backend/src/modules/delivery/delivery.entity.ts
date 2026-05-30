import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Dispatch } from '../dispatch/dispatch.entity';

export enum DeliveryStatus {
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REVISION_REQUESTED = 'revision_requested',
}

export type DeliveryAttachmentSnapshot = {
  fileId: string;
  name: string;
  sizeBytes: number;
  contentType: string;
};

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
  attachments: DeliveryAttachmentSnapshot[];

  @Column({ type: 'enum', enum: DeliveryStatus, enumName: 'delivery_status_enum', default: DeliveryStatus.SUBMITTED })
  status: DeliveryStatus;

  @Column({ name: 'revision_round', default: 0 })
  revisionRound: number;

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;
}
