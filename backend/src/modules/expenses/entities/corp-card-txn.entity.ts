import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('corp_card_transactions')
export class CorpCardTxn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('timestamp')
  @Index()
  postedAt: Date;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'GBP' })
  currencyCode: string;

  @Column()
  merchant: string;

  @Column({ length: 4 })
  last4: string; // Last 4 digits of card

  @Column()
  @Index()
  cardholderId: string; // User ID

  @Column({ nullable: true })
  claimItemId: string; // Link to ExpenseItem when matched

  @Column({ default: false })
  @Index()
  matched: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
