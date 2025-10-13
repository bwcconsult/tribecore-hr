import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { ExpenseClaim } from './expense-claim.entity';

export enum TripType {
  DOMESTIC = 'DOMESTIC',
  INTERNATIONAL = 'INTERNATIONAL',
}

export enum TripStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('trips')
export class Trip extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  tripNumber: string;

  @Column()
  tripName: string;

  @Column({ type: 'enum', enum: TripType })
  tripType: TripType;

  @Column()
  fromLocation: string;

  @Column()
  toLocation: string;

  @Column({ nullable: true })
  destinationCountry?: string;

  @Column({ default: false })
  isVisaRequired: boolean;

  @Column({ type: 'text', nullable: true })
  businessPurpose?: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'enum', enum: TripStatus, default: TripStatus.DRAFT })
  status: TripStatus;

  @Column({ type: 'jsonb', nullable: true })
  travelPreferences?: {
    flightClass?: string;
    hotelPreference?: string;
    mealPreference?: string;
    specialRequests?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  bookingOptions?: {
    flightBooked?: boolean;
    hotelBooked?: boolean;
    carRental?: boolean;
    bookingReferences?: string[];
  };

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  estimatedCost?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  actualCost?: number;

  @Column({ default: 'GBP' })
  currency: string;

  @Column({ nullable: true })
  approvedBy?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  documents?: string[];

  @Column({ type: 'jsonb', nullable: true })
  itinerary?: Array<{
    date: string;
    time: string;
    activity: string;
    location: string;
  }>;

  @Column({ nullable: true })
  submittedBy?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  submittedAt?: Date;

  @OneToMany(() => ExpenseClaim, (claim) => claim.trip)
  expenseClaims: ExpenseClaim[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
