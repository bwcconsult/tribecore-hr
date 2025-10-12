import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RotaStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

@Entity('rotas')
export class Rota {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  organizationId: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({
    type: 'enum',
    enum: RotaStatus,
    default: RotaStatus.DRAFT,
  })
  status: RotaStatus;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  createdBy: string;

  @Column({ nullable: true })
  publishedBy: string;

  @Column({ nullable: true })
  publishedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    allowSwaps: boolean;
    requireApproval: boolean;
    autoAssignOpenShifts: boolean;
    notifyEmployees: boolean;
  };

  @Column({ type: 'simple-array', nullable: true })
  assignedEmployees: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
