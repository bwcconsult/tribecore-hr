import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum ContactRole {
  SPONSOR = 'Sponsor',
  PROJECT_LEAD = 'ProjectLead',
  IT = 'IT',
  SECURITY = 'Security',
  FINANCE = 'Finance',
  END_USER = 'EndUser',
}

@Entity('client_contacts')
export class ClientContact extends BaseEntity {
  @Column()
  accountId: string;

  @ManyToOne(() => require('./client-account.entity').ClientAccount, account => account.contacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accountId' })
  account: any;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({
    type: 'enum',
    enum: ContactRole,
  })
  role: ContactRole;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  jobTitle: string;

  @Column({ default: true })
  primaryContact: boolean;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    timezone?: string;
    language?: string;
    linkedinUrl?: string;
    [key: string]: any;
  };
}
