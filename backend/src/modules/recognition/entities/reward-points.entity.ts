import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PointsTransactionType {
  EARNED = 'EARNED',
  REDEEMED = 'REDEEMED',
  EXPIRED = 'EXPIRED',
  ADJUSTED = 'ADJUSTED',
}

@Entity('reward_points')
export class RewardPoints {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @Column()
  organizationId: string;

  @Column({ type: 'int', default: 0 })
  totalPoints: number;

  @Column({ type: 'int', default: 0 })
  availablePoints: number;

  @Column({ type: 'int', default: 0 })
  redeemedPoints: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('points_transactions')
export class PointsTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @Column({
    type: 'enum',
    enum: PointsTransactionType,
  })
  type: PointsTransactionType;

  @Column({ type: 'int' })
  points: number;

  @Column({ nullable: true })
  recognitionId: string;

  @Column({ nullable: true })
  redemptionId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  processedBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
