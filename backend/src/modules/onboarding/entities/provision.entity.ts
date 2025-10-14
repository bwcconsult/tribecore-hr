import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { OnboardCase } from './onboard-case.entity';

export enum ProvisionType {
  ACCOUNT = 'ACCOUNT',
  EQUIPMENT = 'EQUIPMENT',
  SOFTWARE_LICENSE = 'SOFTWARE_LICENSE',
  ACCESS_BADGE = 'ACCESS_BADGE',
  PARKING = 'PARKING',
  SEATING = 'SEATING',
  PPE = 'PPE',
  TOOLS = 'TOOLS',
}

export enum ProvisionStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  IN_PROGRESS = 'IN_PROGRESS',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

@Entity('provisions')
export class Provision extends BaseEntity {
  @Column()
  caseId: string;

  @ManyToOne(() => OnboardCase)
  @JoinColumn({ name: 'caseId' })
  case: OnboardCase;

  @Column()
  organizationId: string;

  @Column({
    type: 'enum',
    enum: ProvisionType,
  })
  type: ProvisionType;

  @Column()
  item: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ nullable: true })
  assigneeTeam: string; // IT, Facilities, Security

  @Column({
    type: 'enum',
    enum: ProvisionStatus,
    default: ProvisionStatus.REQUESTED,
  })
  status: ProvisionStatus;

  @Column({ type: 'date', nullable: true })
  requestedBy: Date;

  @Column({ type: 'date', nullable: true })
  requiredBy: Date;

  @Column({ nullable: true })
  assignedTo: string;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  completedBy: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    // For ACCOUNT
    system?: string;
    username?: string;
    email?: string;
    groups?: string[];
    
    // For EQUIPMENT
    make?: string;
    model?: string;
    serialNumber?: string;
    assetTag?: string;
    
    // For SOFTWARE_LICENSE
    licenseKey?: string;
    expiryDate?: string;
    
    // For ACCESS_BADGE
    badgeNumber?: string;
    accessLevel?: string;
    
    [key: string]: any;
  };
}
