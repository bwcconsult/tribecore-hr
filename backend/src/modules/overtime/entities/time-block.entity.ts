import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Shift } from './shift.entity';

export enum WorkType {
  WORK = 'WORK', // Regular work
  TRAVEL = 'TRAVEL', // Travel time
  TRAINING = 'TRAINING', // Training/education
  ON_CALL = 'ON_CALL', // On-call duty
  CALL_OUT = 'CALL_OUT', // Called out from on-call
  STANDBY = 'STANDBY', // Standby duty
  MEETING = 'MEETING',
  BREAK = 'BREAK',
}

/**
 * TimeBlock - Immutable atomic time entry
 * Forms a tamper-proof blockchain-style ledger
 * Once created, never modified - only new blocks added for corrections
 */
@Entity('time_blocks')
@Index(['shiftId'])
@Index(['employeeId', 'start'])
@Index(['hash'])
export class TimeBlock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Links to shift (can be null for standalone entries)
  @Column({ nullable: true })
  shiftId: string;

  @ManyToOne(() => Shift, (shift) => shift.timeBlocks, { nullable: true })
  @JoinColumn({ name: 'shiftId' })
  shift: Shift;

  @Column()
  employeeId: string;

  @Column()
  organizationId: string;

  // === TIME ===
  
  @Column()
  start: Date;

  @Column()
  end: Date;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  durationHours: number;

  // === CLASSIFICATION ===
  
  @Column({ type: 'enum', enum: WorkType, default: WorkType.WORK })
  workType: WorkType;

  @Column({ nullable: true })
  costCenter: string;

  @Column({ nullable: true })
  project: string;

  @Column({ nullable: true })
  activityCode: string; // Specific activity/task code

  // === FLAGS ===
  
  @Column({ default: false })
  isEmergency: boolean;

  @Column({ default: false })
  isRemote: boolean;

  @Column({ default: false })
  isPaid: boolean; // Some blocks might not be paid (unpaid breaks)

  @Column({ default: false })
  isCorrection: boolean; // This block corrects a previous entry

  @Column({ nullable: true })
  correctsBlockId: string; // Reference to original block if correction

  // === CAPTURE DETAILS ===
  
  @Column({ nullable: true })
  deviceId: string; // Device that captured this time

  @Column({ nullable: true })
  deviceType: string; // 'TIME_CLOCK', 'MOBILE', 'KIOSK', 'API'

  @Column({ nullable: true })
  captureMethod: string; // 'BIOMETRIC', 'PIN', 'GEOFENCE', 'MANUAL'

  // === LOCATION (Privacy-preserving) ===
  
  @Column({ nullable: true })
  geohash: string; // Hashed location (configurable precision)

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number; // Only stored if required

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  locationName: string; // "Building A", "Remote", etc.

  @Column({ type: 'boolean', nullable: true })
  withinGeofence: boolean;

  @Column({ type: 'int', nullable: true })
  geofenceDistanceMeters: number;

  // === TAMPER-PROOFING ===
  
  @Column()
  hash: string; // SHA256 hash of this block

  @Column({ nullable: true })
  previousHash: string; // Hash of previous block (blockchain-style)

  @Column()
  sequence: number; // Sequential number within employee's timeline

  @Column({ nullable: true })
  deviceSignature: string; // Cryptographic signature from device

  @Column({ nullable: true })
  biometricToken: string; // Hashed biometric verification

  // === ACTOR & EVIDENCE ===
  
  @Column()
  capturedBy: string; // User ID who created this block

  @Column({ nullable: true })
  ipAddress: string; // For audit trail

  @Column({ nullable: true })
  userAgent: string;

  @Column({ type: 'simple-array', nullable: true })
  evidenceUrls: string[]; // Photos, documents proving the time

  // === VALIDATION ===
  
  @Column({ default: false })
  isValidated: boolean;

  @Column({ nullable: true })
  validatedBy: string;

  @Column({ nullable: true })
  validatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  validationErrors: Array<{
    code: string;
    message: string;
    severity: 'WARNING' | 'ERROR';
  }>;

  // === OVERTIME CLASSIFICATION (calculated) ===
  
  @Column({ nullable: true })
  overtimeLineId: string; // Links to OvertimeLine if this generated OT

  @Column({ type: 'simple-array', nullable: true })
  premiumCodes: string[]; // e.g., ['OT150', 'NIGHT', 'WKD']

  // === METADATA ===
  
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    weather?: string;
    temperature?: number;
    patientCount?: number; // Healthcare
    machineId?: string; // Manufacturing
    [key: string]: any;
  };

  // Immutable timestamp
  @CreateDateColumn()
  createdAt: Date;

  // === HELPER METHODS ===

  /**
   * Generate hash for this block
   * Uses employeeId, timestamps, workType, and previousHash
   */
  generateHash(): string {
    const crypto = require('crypto');
    const data = `${this.employeeId}|${this.start.toISOString()}|${this.end.toISOString()}|${this.workType}|${this.previousHash || ''}|${this.sequence}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Verify this block hasn't been tampered with
   */
  verifyHash(): boolean {
    const calculatedHash = this.generateHash();
    return calculatedHash === this.hash;
  }

  /**
   * Check if this block overlaps with another
   */
  overlaps(other: TimeBlock): boolean {
    return (
      (this.start >= other.start && this.start < other.end) ||
      (this.end > other.start && this.end <= other.end) ||
      (this.start <= other.start && this.end >= other.end)
    );
  }
}
