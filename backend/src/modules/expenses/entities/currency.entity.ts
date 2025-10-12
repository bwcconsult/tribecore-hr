import {
  Entity,
  Column,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';

@Entity('currencies')
export class Currency {
  @PrimaryColumn({ length: 3 })
  code: string; // e.g., GBP, USD, EUR

  @Column({ length: 5 })
  symbol: string; // £, $, €

  @Column()
  name: string; // British Pound, US Dollar

  @Column('decimal', { precision: 12, scale: 6, default: 1.0 })
  fxToBase: number; // Exchange rate relative to base currency (GBP=1.0)

  @UpdateDateColumn()
  updatedAt: Date;
}
