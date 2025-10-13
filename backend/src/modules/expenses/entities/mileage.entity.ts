import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { ExpenseClaim } from './expense-claim.entity';

export enum VehicleType {
  CAR = 'CAR',
  MOTORCYCLE = 'MOTORCYCLE',
  BICYCLE = 'BICYCLE',
  VAN = 'VAN',
}

export enum MileageStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

@Entity('mileage_claims')
export class Mileage extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ nullable: true })
  expenseClaimId?: string;

  @ManyToOne(() => ExpenseClaim, { nullable: true })
  @JoinColumn({ name: 'expenseClaimId' })
  expenseClaim?: ExpenseClaim;

  @Column()
  mileageNumber: string;

  @Column({ type: 'date' })
  travelDate: Date;

  @Column({ type: 'enum', enum: VehicleType })
  vehicleType: VehicleType;

  @Column({ nullable: true })
  vehicleRegistration?: string;

  @Column()
  fromLocation: string;

  @Column()
  toLocation: string;

  @Column({ type: 'jsonb', nullable: true })
  route?: Array<{
    location: string;
    purpose: string;
  }>;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  distance: number;

  @Column({ default: 'miles' })
  distanceUnit: string;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  ratePerUnit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({ default: 'GBP' })
  currency: string;

  @Column({ type: 'text' })
  purpose: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: false })
  isRoundTrip: boolean;

  @Column({ default: false })
  hasPassengers: boolean;

  @Column({ type: 'int', nullable: true })
  passengerCount?: number;

  @Column({ type: 'enum', enum: MileageStatus, default: MileageStatus.DRAFT })
  status: MileageStatus;

  @Column({ nullable: true })
  approvedBy?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ type: 'jsonb', nullable: true })
  gpsCoordinates?: {
    startLat?: number;
    startLng?: number;
    endLat?: number;
    endLng?: number;
    routePolyline?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
