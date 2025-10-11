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

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  // Personal Details
  @Column({ nullable: true })
  preferredName?: string;

  @Column({ nullable: true })
  pronouns?: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ nullable: true })
  gender?: string;

  @Column({ nullable: true })
  nationality?: string;

  @Column({ nullable: true })
  maritalStatus?: string;

  @Column({ nullable: true })
  personalEmail?: string;

  @Column({ nullable: true })
  workPhone?: string;

  @Column({ nullable: true })
  personalPhone?: string;

  // Address
  @Column({ nullable: true })
  addressLine1?: string;

  @Column({ nullable: true })
  addressLine2?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  postcode?: string;

  @Column({ nullable: true })
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
