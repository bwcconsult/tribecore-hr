import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('sign_user_signatures')
export class UserSignature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'text', nullable: true })
  signatureData: string;

  @Column({ type: 'text', nullable: true })
  initialData: string;

  @Column({ type: 'text', nullable: true })
  stampData: string;

  @Column({ type: 'varchar', nullable: true })
  company: string;

  @Column({ type: 'varchar', nullable: true })
  jobTitle: string;

  @Column({ type: 'varchar', default: 'MMM dd yyyy HH:mm:ss' })
  dateFormat: string;

  @Column({ type: 'varchar', default: 'Europe/London' })
  timeZone: string;

  @Column({ type: 'boolean', default: false })
  delegateEnabled: boolean;

  @Column({ type: 'uuid', nullable: true })
  delegateUserId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
