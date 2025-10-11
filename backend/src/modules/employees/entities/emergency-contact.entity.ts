import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Employee } from './employee.entity';

export enum Relationship {
  SPOUSE = 'SPOUSE',
  PARTNER = 'PARTNER',
  PARENT = 'PARENT',
  CHILD = 'CHILD',
  SIBLING = 'SIBLING',
  FRIEND = 'FRIEND',
  OTHER = 'OTHER',
}

@Entity('emergency_contacts')
@Index(['personId', 'isPrimary'])
export class EmergencyContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  personId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'personId' })
  person: Employee;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: Relationship,
  })
  relationship: Relationship;

  @Column({ nullable: true })
  relationshipOther: string; // If relationship is OTHER

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  alternativePhone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // GDPR: Consent for storing contact data
  @Column({ default: false })
  consentGiven: boolean;

  @Column({ type: 'timestamp', nullable: true })
  consentDate: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  modifiedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // GDPR: Data retention
  @Column({ type: 'date', nullable: true })
  retentionUntil: Date;
}
