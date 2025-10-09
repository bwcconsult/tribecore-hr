import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { DocumentType } from '../../../common/enums';
import { Employee } from '../../employees/entities/employee.entity';
import { Organization } from '../../organization/entities/organization.entity';

@Entity('documents')
export class Document extends BaseEntity {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
  })
  documentType: DocumentType;

  @Column()
  fileUrl: string;

  @Column()
  fileName: string;

  @Column()
  fileSize: number;

  @Column()
  mimeType: string;

  @Column({ nullable: true })
  employeeId?: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'employeeId' })
  employee?: Employee;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  uploadedBy: string;

  @Column({ type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verifiedBy?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  verifiedAt?: Date;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
