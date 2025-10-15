import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ClientOnboardingCase } from './client-onboarding-case.entity';
import { COTask } from './co-task.entity';

export enum WorkstreamName {
  SECURITY = 'Security',
  LEGAL = 'Legal',
  TECHNICAL = 'Technical',
  BILLING = 'Billing',
  TRAINING = 'Training',
}

@Entity('workstreams')
export class Workstream extends BaseEntity {
  @Column()
  caseId: string;

  @ManyToOne(() => ClientOnboardingCase, caseEntity => caseEntity.workstreams, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caseId' })
  case: ClientOnboardingCase;

  @Column({
    type: 'enum',
    enum: WorkstreamName,
  })
  name: WorkstreamName;

  @Column({ nullable: true })
  leadId: string; // User ID responsible for this workstream

  @Column({ type: 'int', default: 0 })
  completionPercentage: number;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => COTask, task => task.workstream, { cascade: true })
  tasks: COTask[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    description?: string;
    estimatedDays?: number;
    [key: string]: any;
  };
}
