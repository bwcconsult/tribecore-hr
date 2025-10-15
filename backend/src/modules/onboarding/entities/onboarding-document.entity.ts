import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { OnboardCase } from './onboard-case.entity';

export enum DocumentKind {
  NDA = 'NDA',
  ID = 'ID',
  TAX_FORM = 'TAX_FORM',
  POLICY = 'POLICY',
  CONTRACT = 'CONTRACT',
  RIGHT_TO_WORK = 'RIGHT_TO_WORK',
  BACKGROUND_CHECK = 'BACKGROUND_CHECK',
  BENEFITS_ENROLLMENT = 'BENEFITS_ENROLLMENT',
  BANK_DETAILS = 'BANK_DETAILS',
  OTHER = 'OTHER',
}

@Entity('onboarding_documents')
export class OnboardingDocument extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  caseId: string;

  @ManyToOne(() => OnboardCase, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  case: OnboardCase;

  @Column({
    type: 'enum',
    enum: DocumentKind,
  })
  kind: DocumentKind;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  url: string; // Storage URL

  @Column({ nullable: true })
  fileSize: number; // In bytes

  @Column({ nullable: true })
  mimeType: string;

  @Column({ default: false })
  eSigned: boolean;

  @Column({ nullable: true })
  eSignatureRef: string; // Reference to e-signature service

  @Column({ type: 'timestamp', nullable: true })
  signedAt: Date;

  @Column({ nullable: true })
  verifiedBy: string; // User ID who verified

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ default: false })
  isRequired: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date; // For documents like right-to-work that expire

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    uploadedBy?: string;
    category?: string;
    tags?: string[];
    [key: string]: any;
  };
}
