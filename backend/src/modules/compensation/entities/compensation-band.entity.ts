import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('compensation_bands')
export class CompensationBand extends BaseEntity {
  @Column()
  @Index()
  organizationId: string;

  @Column()
  bandCode: string; // 'IC1', 'IC2', 'M1', 'M2'

  @Column()
  bandName: string;

  @Column({ nullable: true })
  jobFamily?: string;

  @Column({ nullable: true })
  jobLevel?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  minSalary: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  midSalary: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  maxSalary: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ nullable: true })
  payFrequency?: string; // 'ANNUAL', 'MONTHLY', 'HOURLY'

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
