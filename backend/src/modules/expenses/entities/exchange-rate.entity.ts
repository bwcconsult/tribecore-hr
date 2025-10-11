import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('exchange_rates')
@Index(['baseCurrency', 'targetCurrency', 'date'], { unique: true })
export class ExchangeRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 3 })
  @Index()
  baseCurrency: string;

  @Column({ length: 3 })
  @Index()
  targetCurrency: string;

  @Column('decimal', { precision: 12, scale: 6 })
  rate: number;

  @Column('date')
  @Index()
  date: Date;

  @Column({ length: 50, nullable: true })
  source: string; // e.g., 'openexchangerates', 'exchangerate-api'

  @Column('jsonb', { nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
