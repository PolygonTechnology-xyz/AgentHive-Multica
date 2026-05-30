import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Dispatch } from '../dispatch/dispatch.entity';

@Entity('delivery_files')
export class DeliveryFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Dispatch)
  dispatch: Dispatch;

  @Column({ name: 'dispatch_id' })
  dispatchId: string;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @Column({ name: 'original_name', length: 255 })
  originalName: string;

  @Column({ name: 'content_type', length: 255 })
  contentType: string;

  @Column({ name: 'size_bytes' })
  sizeBytes: number;

  @Column({ name: 'storage_path', length: 1000 })
  storagePath: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
