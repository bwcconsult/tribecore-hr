import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tax_codes')
export class TaxCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 10 })
  region: string; // "UK", "US", etc.

  @Column({ unique: true, length: 20 })
  code: string; // e.g., "VAT20", "VAT0"

  @Column('decimal', { precision: 5, scale: 4 })
  rate: number; // 0.20 for 20%

  @Column()
  name: string; // "Standard 20%", "Zero Rated"

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
