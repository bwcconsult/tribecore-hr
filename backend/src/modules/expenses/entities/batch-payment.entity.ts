import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum BatchPaymentStatus {
  DRAFT = 'draft',
  READY_TO_PROCESS = 'ready_to_process',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum BatchPaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CHEQUE = 'cheque',
  DIRECT_DEPOSIT = 'direct_deposit',
}

@Entity('batch_payments')
export class BatchPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'batch_name' })
  batchName: string;

  @Column({ default: 'GBP' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: BatchPaymentStatus,
    default: BatchPaymentStatus.DRAFT,
  })
  status: BatchPaymentStatus;

  @Column({
    type: 'enum',
    enum: BatchPaymentMethod,
    default: BatchPaymentMethod.BANK_TRANSFER,
  })
  paymentMethod: BatchPaymentMethod;

  @Column({ name: 'payment_date', type: 'date', nullable: true })
  paymentDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'int', default: 0 })
  itemCount: number;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'processed_by', nullable: true })
  processedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'processed_by' })
  processor: User;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ type: 'json', nullable: true })
  items: any[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
