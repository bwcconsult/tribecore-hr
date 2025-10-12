import { Entity, Column, BeforeInsert, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserRole } from '../../../common/enums';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [UserRole.EMPLOYEE],
  })
  roles: UserRole[];

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ nullable: true })
  organizationId?: string;

  @Column({ nullable: true })
  orgUnit?: string;

  @Column({ nullable: true })
  managerId?: string;

  @Column({ nullable: true })
  bankAccount?: string;

  @Column({ default: 'Europe/London' })
  timezone: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Personal Details (select: false to prevent querying non-existent columns)
  @Column({ nullable: true, select: false })
  preferredName?: string;

  @Column({ nullable: true, select: false })
  pronouns?: string;

  @Column({ type: 'date', nullable: true, select: false })
  dateOfBirth?: Date;

  @Column({ nullable: true, select: false })
  gender?: string;

  @Column({ nullable: true, select: false })
  nationality?: string;

  @Column({ nullable: true, select: false })
  maritalStatus?: string;

  @Column({ nullable: true, select: false })
  personalEmail?: string;

  @Column({ nullable: true, select: false })
  workPhone?: string;

  @Column({ nullable: true, select: false })
  personalPhone?: string;

  // Address (select: false to prevent querying non-existent columns)
  @Column({ nullable: true, select: false })
  addressLine1?: string;

  @Column({ nullable: true, select: false })
  addressLine2?: string;

  @Column({ nullable: true, select: false })
  city?: string;

  @Column({ nullable: true, select: false })
  state?: string;

  @Column({ nullable: true, select: false })
  postcode?: string;

  @Column({ nullable: true, select: false })
  country?: string;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
