import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum DocumentStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  RECALLED = 'recalled',
}

export enum DocumentType {
  SEND_FOR_SIGNATURES = 'send_for_signatures',
  SIGN_YOURSELF = 'sign_yourself',
  TEMPLATE = 'template',
  BULK_SEND = 'bulk_send',
}

@Entity('sign_documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  fileName: string;

  @Column()
  fileUrl: string;

  @Column({ nullable: true })
  fileSize: number;

  @Column({ nullable: true })
  mimeType: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.DRAFT,
  })
  status: DocumentStatus;

  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.SEND_FOR_SIGNATURES,
  })
  type: DocumentType;

  @Column({ type: 'uuid' })
  createdBy: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column({ type: 'uuid', nullable: true })
  templateId: string;

  @Column({ type: 'text', nullable: true })
  noteToRecipients: string;

  @Column({ type: 'boolean', default: false })
  sendInOrder: boolean;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  scheduledFor: Date;

  @Column({ type: 'jsonb', nullable: true })
  settings: any;

  @OneToMany('Recipient', 'document', {
    cascade: true,
  })
  recipients: any[];

  @OneToMany('ActivityLog', 'document')
  activityLogs: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
