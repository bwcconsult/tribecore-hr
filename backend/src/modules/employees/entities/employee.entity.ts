import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { EmploymentType, EmploymentStatus } from '../../../common/enums';
import { Organization } from '../../organization/entities/organization.entity';
import { User } from '../../users/entities/user.entity';

@Entity('employees')
export class Employee extends BaseEntity {
  @Column({ unique: true })
  employeeId: string;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ nullable: true })
  nationality?: string;

  @Column({ nullable: true })
  nationalId?: string;

  @Column({ nullable: true })
  passportNumber?: string;

  @Column({ nullable: true })
  taxNumber?: string;

  @Column({ nullable: true })
  taxReference?: string; // UK PAYE Tax Reference

  @Column({ nullable: true })
  niNumber?: string; // UK National Insurance Number

  @Column({ nullable: true })
  taxDistrict?: string; // UK Tax District

  @Column({ nullable: true })
  socialSecurityNumber?: string;

  @Column()
  department: string;

  @Column()
  jobTitle: string;

  @Column({ nullable: true })
  managerId?: string;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'managerId' })
  manager?: Employee;

  @Column({ type: 'date' })
  hireDate: Date;

  @Column({ type: 'date', nullable: true })
  terminationDate?: Date;

  @Column({
    type: 'enum',
    enum: EmploymentType,
    default: EmploymentType.FULL_TIME,
  })
  employmentType: EmploymentType;

  @Column({
    type: 'enum',
    enum: EmploymentStatus,
    default: EmploymentStatus.ACTIVE,
  })
  status: EmploymentStatus;

  @Column({ nullable: true })
  workLocation?: string; // Now configurable from organization settings

  @Column({ nullable: true })
  officeLocation?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  baseSalary: number;

  @Column({ default: 'GBP' })
  salaryCurrency: string;

  @Column({ nullable: true })
  bankName?: string;

  @Column({ nullable: true })
  bankAccountNumber?: string;

  @Column({ nullable: true })
  bankSortCode?: string;

  @Column({ nullable: true })
  bankRoutingNumber?: string;

  @Column({ nullable: true })
  emergencyContactName?: string;

  @Column({ nullable: true })
  emergencyContactPhone?: string;

  @Column({ nullable: true })
  emergencyContactRelation?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  postalCode?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  profilePicture?: string;

  @Column({ type: 'int', default: 0 })
  annualLeaveBalance: number;

  @Column({ type: 'int', default: 0 })
  sickLeaveBalance: number;

  @Column({ type: 'jsonb', nullable: true })
  customFields?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
