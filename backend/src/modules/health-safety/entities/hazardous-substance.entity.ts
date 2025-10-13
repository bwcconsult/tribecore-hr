import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum HazardClass {
  EXPLOSIVE = 'EXPLOSIVE',
  FLAMMABLE = 'FLAMMABLE',
  OXIDIZING = 'OXIDIZING',
  TOXIC = 'TOXIC',
  CORROSIVE = 'CORROSIVE',
  IRRITANT = 'IRRITANT',
  HARMFUL = 'HARMFUL',
  CARCINOGENIC = 'CARCINOGENIC',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
}

@Entity('hazardous_substances')
export class HazardousSubstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @Column({ unique: true })
  substanceCode: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  chemicalName: string;

  @Column({ nullable: true })
  casNumber: string; // Chemical Abstracts Service number

  @Column({ type: 'simple-array' })
  hazardClasses: HazardClass[];

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  locations: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quantityStored: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ nullable: true })
  supplier: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ type: 'simple-array', nullable: true })
  safetyDataSheets: string[]; // URLs to SDS documents

  @Column({ type: 'text', nullable: true })
  healthHazards: string;

  @Column({ type: 'text', nullable: true })
  physicalHazards: string;

  @Column({ type: 'text', nullable: true })
  environmentalHazards: string;

  @Column({ type: 'jsonb' })
  controlMeasures: {
    engineering?: string[];
    administrative?: string[];
    ppe?: string[];
    storage?: string[];
    disposal?: string[];
  };

  @Column({ type: 'text', nullable: true })
  emergencyProcedures: string;

  @Column({ type: 'text', nullable: true })
  firstAidMeasures: string;

  @Column({ type: 'text', nullable: true })
  spillageProcedures: string;

  @Column({ type: 'simple-array', nullable: true })
  authorizedUsers: string[];

  @Column({ nullable: true })
  coshhAssessmentId: string;

  @Column({ type: 'date', nullable: true })
  lastReviewDate: Date;

  @Column({ type: 'date', nullable: true })
  nextReviewDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
