import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum QualificationType {
  DEGREE = 'DEGREE',
  DIPLOMA = 'DIPLOMA',
  CERTIFICATE = 'CERTIFICATE',
  PROFESSIONAL_CERTIFICATION = 'PROFESSIONAL_CERTIFICATION',
  LICENSE = 'LICENSE',
  OTHER = 'OTHER',
}

@Entity('education_history')
@Index(['personId'])
export class EducationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  personId: string;

  @Column()
  institution: string;

  @Column()
  degree: string; // e.g., "Bachelor of Science", "Master of Arts"

  @Column({ nullable: true })
  fieldOfStudy: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  grade: string; // e.g., "First Class", "3.8 GPA"

  @Column({ default: false })
  isCurrentlyEnrolled: boolean;

  @Column({ type: 'text', nullable: true })
  achievements: string;

  @Column({ nullable: true })
  attachmentUrl: string;

  @Column({ nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('professional_qualifications')
@Index(['personId', 'expiryDate'])
export class ProfessionalQualification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  personId: string;

  @Column({
    type: 'enum',
    enum: QualificationType,
    default: QualificationType.CERTIFICATE,
  })
  type: QualificationType;

  @Column()
  name: string;

  @Column({ nullable: true })
  issuer: string; // e.g., "Microsoft", "AWS", "CIPD"

  @Column({ nullable: true })
  credentialId: string;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date', nullable: true })
  @Index()
  expiryDate: Date;

  @Column({ default: false })
  doesNotExpire: boolean;

  @Column({ nullable: true })
  verificationUrl: string;

  @Column({ nullable: true })
  attachmentUrl: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Expiry reminder tracking
  @Column({ default: false })
  reminderSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  reminderSentAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('languages')
@Index(['personId'])
export class Language {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  personId: string;

  @Column()
  language: string;

  @Column({ nullable: true })
  proficiency: string; // CEFR: A1, A2, B1, B2, C1, C2

  @Column({ default: false })
  isNative: boolean;

  @Column({ default: false })
  canRead: boolean;

  @Column({ default: false })
  canWrite: boolean;

  @Column({ default: false })
  canSpeak: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('licenses')
@Index(['personId', 'expiryDate'])
export class License {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  personId: string;

  @Column()
  type: string; // e.g., "Driving License", "Forklift License"

  @Column({ nullable: true })
  licenseNumber: string;

  @Column({ nullable: true })
  issuer: string;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date', nullable: true })
  @Index()
  expiryDate: Date;

  @Column({ nullable: true })
  attachmentUrl: string;

  @Column({ type: 'text', nullable: true })
  restrictions: string;

  // Expiry reminder
  @Column({ default: false })
  reminderSent: boolean;

  @Column({ nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
