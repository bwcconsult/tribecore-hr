import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('negotiation_versions')
@Index(['contractId', 'versionNumber'])
export class NegotiationVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  contractId: string;

  @ManyToOne('Contract', 'versions')
  @JoinColumn({ name: 'contractId' })
  contract: any;

  @Column({ type: 'int' })
  versionNumber: number;

  @Column({ nullable: true })
  documentUrl: string; // URL to this version in storage

  @Column({ nullable: true })
  diffUrl: string; // URL to diff/redline document

  @Column('text', { nullable: true })
  changesSummary: string;

  @Column('simple-json', { nullable: true })
  changedClauses: string[]; // Array of clause IDs that changed

  @Column()
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column({ nullable: true })
  party: string; // INTERNAL or COUNTERPARTY

  @Column('text', { nullable: true })
  comment: string;

  @Column({ default: false })
  isFinal: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
