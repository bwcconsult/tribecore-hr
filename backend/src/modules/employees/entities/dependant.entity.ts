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
import { Relationship } from './emergency-contact.entity';

@Entity('dependants')
@Index(['personId'])
export class Dependant {
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
  relationshipOther: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  nationality: string;

  // For benefit enrollment purposes
  @Column({ default: false })
  isDependent: boolean;

  // Can also be emergency contact
  @Column({ default: false })
  isEmergencyContact: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // GDPR: Consent for storing dependant data
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
