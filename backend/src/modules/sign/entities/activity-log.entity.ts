import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ActivityType {
  DOCUMENT_CREATED = 'document_created',
  DOCUMENT_SENT = 'document_sent',
  DOCUMENT_VIEWED = 'document_viewed',
  DOCUMENT_SIGNED = 'document_signed',
  DOCUMENT_DECLINED = 'document_declined',
  DOCUMENT_COMPLETED = 'document_completed',
  DOCUMENT_RECALLED = 'document_recalled',
  DOCUMENT_EXPIRED = 'document_expired',
  DOCUMENT_SCHEDULED = 'document_scheduled',
  RECIPIENT_ADDED = 'recipient_added',
  RECIPIENT_REMOVED = 'recipient_removed',
  REMINDER_SENT = 'reminder_sent',
  ACCESS_FAILED = 'access_failed',
}

@Entity('sign_activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  documentId: string;

  @ManyToOne('Document', 'activityLogs', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'documentId' })
  document: any;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  activity: ActivityType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', nullable: true })
  userAgent: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  performedAt: Date;
}
