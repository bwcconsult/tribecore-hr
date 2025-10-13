import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Template } from './template.entity';

export enum SignFormStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  LIMIT_REACHED = 'limit_reached',
}

@Entity('sign_forms')
export class SignForm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'uuid', nullable: true })
  templateId: string;

  @ManyToOne(() => Template, { eager: false })
  @JoinColumn({ name: 'templateId' })
  template: Template;

  @Column({ type: 'uuid' })
  ownerId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({
    type: 'enum',
    enum: SignFormStatus,
    default: SignFormStatus.ACTIVE,
  })
  status: SignFormStatus;

  @Column({ type: 'timestamp', nullable: true })
  validUntil: Date;

  @Column({ type: 'boolean', default: false })
  requireOtp: boolean;

  @Column({ type: 'int', nullable: true })
  responseLimit: number;

  @Column({ type: 'int', default: 0 })
  responseCount: number;

  @Column({ type: 'boolean', default: false })
  avoidDuplicates: boolean;

  @Column({ type: 'int', default: 7 })
  duplicateCheckDays: number;

  @Column({ type: 'jsonb', nullable: true })
  settings: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
