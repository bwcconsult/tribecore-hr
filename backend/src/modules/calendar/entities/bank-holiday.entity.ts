import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('bank_holidays')
@Index(['region', 'date'])
export class BankHoliday {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  region: string; // e.g., 'UK', 'UK-England', 'UK-Scotland', 'UK-Wales', 'UK-NI'

  @Column({ type: 'date' })
  @Index()
  date: Date;

  @Column()
  name: string;

  @Column({ default: false })
  isHalfDay: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Recurring pattern (optional)
  @Column({ nullable: true })
  recurrenceRule: string; // e.g., 'RRULE:FREQ=YEARLY;BYMONTH=12;BYMONTHDAY=25'

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
