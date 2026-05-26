import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'actor_id', nullable: true })
  actorId: string;

  @Column({ name: 'actor_type', length: 20, default: 'anonymous' })
  actorType: string;

  @Index()
  @Column({ length: 100 })
  action: string;

  @Index()
  @Column({ name: 'resource_type', length: 50, nullable: true })
  resourceType: string;

  @Index()
  @Column({ name: 'resource_id', nullable: true })
  resourceId: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, unknown>;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
