import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum RecipientRole {
  NEEDS_TO_SIGN = 'needs_to_sign',
  IN_PERSON_SIGNER = 'in_person_signer',
  SIGNS_WITH_WITNESS = 'signs_with_witness',
  MANAGES_RECIPIENTS = 'manages_recipients',
  APPROVER = 'approver',
  RECEIVES_COPY = 'receives_copy',
}

export enum RecipientStatus {
  PENDING = 'pending',
  SENT = 'sent',
  VIEWED = 'viewed',
  SIGNED = 'signed',
  DECLINED = 'declined',
  COMPLETED = 'completed',
}

export enum DeliveryMethod {
  EMAIL = 'email',
  EMAIL_SMS = 'email_sms',
  LINK = 'link',
}

@Entity('sign_recipients')
export class Recipient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  documentId: string;

  @ManyToOne('Document', 'recipients', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'documentId' })
  document: any;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: RecipientRole,
    default: RecipientRole.NEEDS_TO_SIGN,
  })
  role: RecipientRole;

  @Column({
    type: 'enum',
    enum: RecipientStatus,
    default: RecipientStatus.PENDING,
  })
  status: RecipientStatus;

  @Column({
    type: 'enum',
    enum: DeliveryMethod,
    default: DeliveryMethod.EMAIL,
  })
  deliveryMethod: DeliveryMethod;

  @Column({ type: 'int', default: 1 })
  order: number;

  @Column({ type: 'varchar', nullable: true })
  signatureToken: string;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  viewedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  signedAt: Date;

  @Column({ type: 'text', nullable: true })
  declineReason: string;

  @Column({ type: 'text', nullable: true })
  signatureData: string;

  @Column({ type: 'text', nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
