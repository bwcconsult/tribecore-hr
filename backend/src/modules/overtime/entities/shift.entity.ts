import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';

export enum ShiftType {
  DAY = 'DAY',
  NIGHT = 'NIGHT',
  EVENING = 'EVENING',
  HOLIDAY = 'HOLIDAY',
  WEEKEND = 'WEEKEND',
  STANDBY = 'STANDBY',
  ON_CALL = 'ON_CALL',
}

export enum ShiftStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CONFIRMED = 'CONFIRMED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum CaptureSource {
  ROSTER = 'ROSTER', // From scheduling system
  MANUAL = 'MANUAL', // Manually entered
  TIME_CLOCK = 'TIME_CLOCK', // Biometric device
  MOBILE_APP = 'MOBILE_APP',
  GEOFENCE = 'GEOFENCE', // Location-based
  API = 'API', // External system
  IVR = 'IVR', // Phone system
  KIOSK = 'KIOSK',
}

/**
 * Shift - Enhanced time capture entity
 * Records all work periods with detailed tracking
 */
@Entity('shifts')
@Index(['employeeId', 'scheduledStart'])
@Index(['locationId', 'scheduledStart'])
@Index(['status'])
export class Shift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @Column()
  organizationId: string;

  @Column({ nullable: true })
  locationId: string;

  @Column({ nullable: true })
  costCenter: string;

  @Column({ nullable: true })
  project: string;

  @Column({ nullable: true })
  departmentId: string;

  // === TIME TRACKING ===
  
  @Column()
  scheduledStart: Date;

  @Column()
  scheduledEnd: Date;

  @Column({ nullable: true })
  actualStart: Date;

  @Column({ nullable: true })
  actualEnd: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  scheduledHours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualHours: number;

  // === BREAKS ===
  
  @Column({ type: 'jsonb', nullable: true })
  breaks: Array<{
    id: string;
    start: Date;
    end: Date;
    durationMinutes: number;
    isPaid: boolean;
    type: 'MEAL' | 'REST' | 'OTHER';
    notes?: string;
  }>;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  paidBreakHours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unpaidBreakHours: number;

  // === CLASSIFICATION ===
  
  @Column({ type: 'enum', enum: ShiftType, default: ShiftType.DAY })
  shiftType: ShiftType;

  @Column({ type: 'enum', enum: ShiftStatus, default: ShiftStatus.SCHEDULED })
  status: ShiftStatus;

  @Column({ type: 'enum', enum: CaptureSource })
  source: CaptureSource;

  @Column({ default: false })
  isEmergency: boolean;

  @Column({ default: false })
  isRemote: boolean;

  @Column({ default: false })
  isPreApproved: boolean;

  // === APPROVALS ===
  
  @Column({ nullable: true })
  confirmedBy: string; // Employee confirmation

  @Column({ nullable: true })
  confirmedAt: Date;

  @Column({ nullable: true })
  approvedBy: string; // Manager approval

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  rejectedBy: string;

  @Column({ nullable: true })
  rejectedAt: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  // === DEVICE & LOCATION ===
  
  @Column({ nullable: true })
  deviceId: string; // Time clock or mobile device ID

  @Column({ nullable: true })
  startDeviceId: string;

  @Column({ nullable: true })
  endDeviceId: string;

  @Column({ type: 'jsonb', nullable: true })
  startLocation: {
    latitude?: number;
    longitude?: number;
    geohash?: string; // Privacy-preserving location
    address?: string;
    withinGeofence?: boolean;
    distanceMeters?: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  endLocation: {
    latitude?: number;
    longitude?: number;
    geohash?: string;
    address?: string;
    withinGeofence?: boolean;
    distanceMeters?: number;
  };

  // === WORK DETAILS ===
  
  @Column({ type: 'text', nullable: true })
  taskDescription: string;

  @Column({ nullable: true })
  skillRequired: string;

  @Column({ nullable: true })
  licenseRequired: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[]; // e.g., ['ICU', 'FORKLIFT', 'URGENT']

  // === OVERTIME TRACKING ===
  
  @Column({ default: false })
  hasOvertime: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  overtimeHours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  overtimeAmount: number;

  @Column({ default: false })
  isProcessed: boolean; // Has been calculated and posted

  @Column({ nullable: true })
  processedInPayrollId: string;

  @Column({ nullable: true })
  processedAt: Date;

  // === EXCEPTIONS & FLAGS ===
  
  @Column({ type: 'jsonb', nullable: true })
  exceptions: Array<{
    type: 'MISSED_PUNCH' | 'REST_BREACH' | 'GEOFENCE_FAIL' | 'OVERLAP' | 'MISSING_BREAK' | 'THRESHOLD_BREACH';
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    message: string;
    timestamp: Date;
    resolvedBy?: string;
    resolvedAt?: Date;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  flags: {
    restBreachHours?: number; // Hours short of minimum rest
    consecutiveDays?: number; // Days worked consecutively
    fatigueScore?: number; // Calculated fatigue index
    safeStaffingBreach?: boolean; // NHS/Healthcare specific
    budgetOverrun?: boolean;
  };

  // === FATIGUE TRACKING ===
  
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  fatigueScore: number; // Rolling fatigue index (0-100)

  @Column({ nullable: true })
  hoursSinceLastRest: number;

  @Column({ nullable: true })
  consecutiveDaysWorked: number;

  // === ATTACHMENTS & NOTES ===
  
  @Column({ type: 'simple-array', nullable: true })
  attachments: string[]; // URLs to photos, documents

  @Column({ type: 'text', nullable: true })
  employeeNotes: string;

  @Column({ type: 'text', nullable: true })
  managerNotes: string;

  // === SIGNATURES ===
  
  @Column({ nullable: true })
  employeeSignature: string; // E-signature or biometric token

  @Column({ nullable: true })
  employeeSignedAt: Date;

  // === AUDIT TRAIL ===
  
  @Column({ type: 'jsonb', nullable: true })
  auditLog: Array<{
    action: string;
    actor: string;
    timestamp: Date;
    changes?: any;
    ipAddress?: string;
    deviceId?: string;
  }>;

  // Relationship to TimeBlocks (immutable ledger)
  @OneToMany(() => require('./time-block.entity').TimeBlock, (timeBlock: any) => timeBlock.shift)
  timeBlocks: any[];

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    rosterId?: string;
    swapRequestId?: string;
    originalShiftId?: string; // If this is a replacement
    patientCount?: number; // Healthcare: patient census
    weatherConditions?: string;
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Calculate actual hours worked (excluding unpaid breaks)
  calculateActualHours(): number {
    if (!this.actualStart || !this.actualEnd) return 0;
    
    const totalMs = this.actualEnd.getTime() - this.actualStart.getTime();
    const totalHours = totalMs / (1000 * 60 * 60);
    
    return totalHours - (this.unpaidBreakHours || 0);
  }

  // Check if shift is in progress
  isInProgress(): boolean {
    return this.status === ShiftStatus.IN_PROGRESS;
  }

  // Check if shift needs approval
  needsApproval(): boolean {
    return this.status === ShiftStatus.COMPLETED && !this.approvedBy;
  }
}
