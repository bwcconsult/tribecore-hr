import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AttachmentType {
  SOW = 'SOW', // Statement of Work
  EXHIBIT = 'EXHIBIT',
  SCHEDULE = 'SCHEDULE',
  CERTIFICATE = 'CERTIFICATE',
  DPIA = 'DPIA', // Data Protection Impact Assessment
  SECURITY_QUESTIONNAIRE = 'SECURITY_QUESTIONNAIRE',
  INSURANCE_CERTIFICATE = 'INSURANCE_CERTIFICATE',
  FINANCIAL_STATEMENT = 'FINANCIAL_STATEMENT',
  REFERENCE = 'REFERENCE',
  SUPPORTING_DOCUMENT = 'SUPPORTING_DOCUMENT',
  SIGNATURE_CERTIFICATE = 'SIGNATURE_CERTIFICATE',
  AUDIT_REPORT = 'AUDIT_REPORT',
  COMPLIANCE_CERT = 'COMPLIANCE_CERT',
}

@Entity('attachments')
@Index(['contractId', 'type'])
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  contractId: string;

  @ManyToOne('Contract', 'attachments')
  @JoinColumn({ name: 'contractId' })
  contract: any;

  @Column({
    type: 'enum',
    enum: AttachmentType,
  })
  type: AttachmentType;

  @Column()
  fileName: string;

  @Column()
  fileUrl: string;

  @Column({ nullable: true })
  fileSize: number; // in bytes

  @Column({ nullable: true })
  mimeType: string;

  @Column({ nullable: true })
  fileHash: string; // SHA-256 for integrity

  @Column({ nullable: true })
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column()
  uploadedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedBy' })
  uploader: User;

  @Column({ default: 1 })
  version: number;

  @Column({ nullable: true })
  supersedesId: string; // Previous version attachment ID

  @CreateDateColumn()
  createdAt: Date;
}
