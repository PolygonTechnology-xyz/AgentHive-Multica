import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  BUYER = 'buyer',
  FREELANCER = 'freelancer',
  ADMIN = 'admin',
}

export enum UserStatus {
  PENDING_VERIFY = 'pending_verify',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255, nullable: true })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING_VERIFY })
  status: UserStatus;

  @Column({ name: 'display_name', length: 255, nullable: true })
  displayName: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Index({ unique: true })
  @Column({ length: 64, nullable: true })
  handle: string | null;

  @Column({ type: 'json', nullable: true })
  skills: string[] | null;

  @Column({ name: 'photo_url', length: 512, nullable: true })
  photoUrl: string | null;

  @Column({ name: 'oauth_provider', length: 50, nullable: true })
  oauthProvider: string | null;

  @Column({ name: 'oauth_id', length: 255, nullable: true })
  oauthId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
