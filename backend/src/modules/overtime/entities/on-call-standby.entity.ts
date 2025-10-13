import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum OnCallType {
  ON_CALL = 'ON_CALL', // Available by phone/remote
  STANDBY = 'STANDBY', // Must remain at facility
  BEEPER = 'BEEPER', // Beeper duty
}

export enum OnCallStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum CallOutStatus {
  NONE = 'NONE',
  CALLED_OUT = 'CALLED_OUT',
  RESPONDED = 'RESPONDED',
  NO_RESPONSE = 'NO_RESPONSE',
}

/**
 * OnCallStandby - On-call and standby duty tracking
 * Tracks availability periods and call-out events
 */
@Entity('on_call_standby')
@Index(['employeeId', 'windowStart'])
@Index(['status'])
export class OnCallStandby {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @Column()
  organizationId: string;

  @Column({ nullable: true })
  departmentId: string;

  @Column({ nullable: true })
  workRuleSetId: string; // Policy governing this on-call

  // === WINDOW ===
  
  @Column()
  windowStart: Date;

  @Column()
  windowEnd: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  durationHours: number;

  // === CLASSIFICATION ===
  
  @Column({ type: 'enum', enum: OnCallType, default: OnCallType.ON_CALL })
  type: OnCallType;

  @Column({ type: 'enum', enum: OnCallStatus, default: OnCallStatus.SCHEDULED })
  status: OnCallStatus;

  @Column({ default: false })
  isEmergency: boolean;

  // === PAYMENT ===
  
  @Column({ nullable: true })
  rateType: string; // 'FLAT', 'HOURLY', 'PERCENTAGE'

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  flatRate: number; // Flat payment for entire period

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  hourlyRate: number; // Hourly rate while on-call

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentageOfBase: number; // e.g., 15% of base salary per hour

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  calculatedAmount: number;

  @Column({ nullable: true })
  earningCode: string; // e.g., 'ON_CALL_AVAIL'

  // === CALL-OUT POLICY ===
  
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  callOutMinimumHours: number; // Minimum hours paid if called (e.g., 2h)

  @Column({ type: 'int', nullable: true })
  responseTimeTargetMinutes: number; // Expected response time

  @Column({ default: false })
  travelTimePaid: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  travelTimeMultiplier: number; // e.g., 1.5x for travel

  // === CALL-OUTS (Events during on-call) ===
  
  @Column({ type: 'jsonb', default: [] })
  callOuts: Array<{
    id: string;
    calledAt: Date;
    respondedAt?: Date;
    arrivedAt?: Date;
    completedAt?: Date;
    status: CallOutStatus;
    
    // Duration
    responseDurationMinutes?: number;
    workDurationHours?: number;
    travelDurationHours?: number;
    
    // Payment
    minimumHoursApplied: boolean;
    hoursToPayWork?: number;
    hoursToPayTravel?: number;
    multiplier?: number;
    amount?: number;
    earningCode?: string;
    
    // Details
    reason?: string;
    location?: string;
    taskDescription?: string;
    shiftId?: string; // If created a shift for this call-out
    overtimeLineId?: string; // If generated OT
    
    // Breach
    breachFlag?: boolean; // Response time breach
    breachMinutes?: number;
    breachReason?: string;
  }>;

  @Column({ type: 'int', default: 0 })
  callOutCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalCallOutHours: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalCallOutAmount: number;

  // === BREACH TRACKING ===
  
  @Column({ default: false })
  hasResponseBreach: boolean; // Any call-out had response time breach

  @Column({ type: 'jsonb', nullable: true })
  breaches: Array<{
    callOutId: string;
    expectedMinutes: number;
    actualMinutes: number;
    excessMinutes: number;
    timestamp: Date;
    reason?: string;
    waived?: boolean;
    waivedBy?: string;
  }>;

  // === CONSTRAINTS & ELIGIBILITY ===
  
  @Column({ nullable: true })
  skillRequired: string; // Required skill/certification

  @Column({ nullable: true })
  licenseRequired: string;

  @Column({ type: 'simple-array', nullable: true })
  equipmentRequired: string[]; // Required equipment/tools

  @Column({ type: 'int', nullable: true })
  maxDistanceKm: number; // Max distance from facility

  // === COVERAGE & ROTATION ===
  
  @Column({ nullable: true })
  rotationId: string; // Part of rotation schedule

  @Column({ nullable: true })
  coveringFor: string; // Covering for another employee

  @Column({ nullable: true })
  backupEmployeeId: string; // Backup if unavailable

  @Column({ default: false })
  isBackup: boolean; // This is a backup assignment

  // === APPROVAL ===
  
  @Column({ default: false })
  requiresApproval: boolean;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ nullable: true })
  approvedAt: Date;

  // === CONFIRMATION ===
  
  @Column({ default: false })
  isConfirmed: boolean; // Employee confirmed availability

  @Column({ nullable: true })
  confirmedBy: string;

  @Column({ nullable: true })
  confirmedAt: Date;

  @Column({ nullable: true })
  declineReason: string;

  // === TRACKING ===
  
  @Column({ nullable: true })
  actualStartedAt: Date;

  @Column({ nullable: true })
  actualEndedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // === PAYROLL ===
  
  @Column({ default: false })
  isPaid: boolean;

  @Column({ nullable: true })
  paidInPayrollId: string;

  @Column({ nullable: true })
  paidAt: Date;

  // === METADATA ===
  
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    weatherConditions?: string;
    patientCensus?: number; // Healthcare
    equipmentStatus?: string;
    specialInstructions?: string;
    contactNumbers?: string[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // === HELPER METHODS ===

  /**
   * Add a call-out event
   */
  addCallOut(calledAt: Date, reason?: string): string {
    const callOut = {
      id: this.generateId(),
      calledAt,
      status: CallOutStatus.CALLED_OUT,
      minimumHoursApplied: false,
      reason,
    };

    this.callOuts.push(callOut);
    this.callOutCount++;
    
    return callOut.id;
  }

  /**
   * Mark call-out as responded
   */
  respondToCallOut(callOutId: string, respondedAt: Date): void {
    const callOut = this.callOuts.find(c => c.id === callOutId);
    if (!callOut) throw new Error('Call-out not found');

    callOut.respondedAt = respondedAt;
    callOut.status = CallOutStatus.RESPONDED;
    callOut.responseDurationMinutes = Math.round(
      (respondedAt.getTime() - callOut.calledAt.getTime()) / (1000 * 60)
    );

    // Check breach
    if (this.responseTimeTargetMinutes && callOut.responseDurationMinutes > this.responseTimeTargetMinutes) {
      callOut.breachFlag = true;
      callOut.breachMinutes = callOut.responseDurationMinutes - this.responseTimeTargetMinutes;
      this.hasResponseBreach = true;

      this.breaches = this.breaches || [];
      this.breaches.push({
        callOutId,
        expectedMinutes: this.responseTimeTargetMinutes,
        actualMinutes: callOut.responseDurationMinutes,
        excessMinutes: callOut.breachMinutes,
        timestamp: respondedAt,
      });
    }
  }

  /**
   * Complete call-out and calculate payment
   */
  completeCallOut(
    callOutId: string,
    completedAt: Date,
    workHours: number,
    travelHours?: number,
    multiplier?: number,
  ): void {
    const callOut = this.callOuts.find(c => c.id === callOutId);
    if (!callOut) throw new Error('Call-out not found');

    callOut.completedAt = completedAt;
    callOut.workDurationHours = workHours;
    callOut.travelDurationHours = travelHours || 0;

    // Apply minimum hours if configured
    let hoursToPayWork = workHours;
    if (this.callOutMinimumHours && workHours < this.callOutMinimumHours) {
      hoursToPayWork = this.callOutMinimumHours;
      callOut.minimumHoursApplied = true;
    }

    callOut.hoursToPayWork = hoursToPayWork;
    callOut.hoursToPayTravel = travelHours || 0;
    callOut.multiplier = multiplier || 1.5; // Default to 1.5x

    // Calculate amount (base rate would come from employee record)
    // This is placeholder - actual calculation happens in calculation engine
    callOut.amount = 0; // Set by calculation engine

    this.totalCallOutHours += hoursToPayWork + (travelHours || 0);
  }

  /**
   * Get average response time
   */
  getAverageResponseTime(): number | null {
    const respondedCallOuts = this.callOuts.filter(c => c.responseDurationMinutes !== undefined);
    if (respondedCallOuts.length === 0) return null;

    const total = respondedCallOuts.reduce((sum, c) => sum + (c.responseDurationMinutes || 0), 0);
    return total / respondedCallOuts.length;
  }

  /**
   * Check if currently on-call
   */
  isCurrentlyOnCall(): boolean {
    const now = new Date();
    return this.status === OnCallStatus.ACTIVE && 
           now >= this.windowStart && 
           now <= this.windowEnd;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
