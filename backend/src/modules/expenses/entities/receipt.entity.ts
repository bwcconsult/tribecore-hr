import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ExpenseItem } from './expense-item.entity';
import { User } from '../../users/entities/user.entity';

@Entity('receipts')
export class Receipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  expenseItemId: string;

  @ManyToOne(() => ExpenseItem, (item) => item.receipts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expenseItemId' })
  expenseItem: ExpenseItem;

  @Column()
  fileName: string;

  @Column()
  filePath: string; // S3/storage path

  @Column()
  fileSize: number; // in bytes

  @Column()
  mimeType: string;

  @Column({ nullable: true })
  thumbnailPath: string;

  // OCR extracted data
  @Column({ type: 'jsonb', nullable: true })
  ocrData: {
    amount?: number;
    currency?: string;
    date?: string;
    vendor?: string;
    taxAmount?: number;
    confidence?: number;
    rawText?: string;
  };

  @Column({ default: false })
  ocrProcessed: boolean;

  @Column({ default: false })
  verified: boolean;

  @Column({ nullable: true })
  verifiedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'verifiedBy' })
  verifier: User;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column()
  uploadedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedBy' })
  uploader: User;

  // Duplicate detection
  @Column({ nullable: true })
  fileHash: string;

  @Column({ default: false })
  isDuplicate: boolean;

  @Column({ nullable: true })
  duplicateOfId: string;

  @CreateDateColumn()
  uploadedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
