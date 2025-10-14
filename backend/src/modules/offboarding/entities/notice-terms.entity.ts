import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SeparationCase } from './separation-case.entity';

export enum NoticeMethod {
  WORKED = 'WORKED', // Employee works notice period
  PILON = 'PILON', // Payment in Lieu of Notice
  GARDEN_LEAVE = 'GARDEN_LEAVE', // Paid but don't work
}

@Entity('notice_terms')
export class NoticeTerms extends BaseEntity {
  @Column()
  caseId: string;

  @ManyToOne(() => SeparationCase)
  @JoinColumn({ name: 'caseId' })
  case: SeparationCase;

  @Column()
  organizationId: string;

  @Column({ type: 'date' })
  noticeStart: Date;

  @Column({ type: 'date' })
  noticeEnd: Date;

  @Column({ type: 'int' })
  noticeDays: number;

  @Column({
    type: 'enum',
    enum: NoticeMethod,
    default: NoticeMethod.WORKED,
  })
  method: NoticeMethod;

  // Statutory vs contractual
  @Column({ type: 'int', default: 0 })
  statutoryNoticeDays: number;

  @Column({ type: 'int', default: 0 })
  contractualNoticeDays: number;

  // Waiver
  @Column({ default: false })
  waiverSigned: boolean;

  @Column({ type: 'timestamp', nullable: true })
  waiverSignedAt: Date;

  @Column({ nullable: true })
  waiverSignedBy: string;

  // PILON calculation
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  pilonAmount: number;

  @Column({ default: false })
  pilonPaid: boolean;

  // Garden leave specifics
  @Column({ default: false })
  gardenLeaveRestrictions: boolean;

  @Column({ type: 'text', nullable: true })
  gardenLeaveTerms: string;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    calculation?: {
      basedOnTenure?: boolean;
      basedOnContract?: boolean;
      formula?: string;
    };
    restrictions?: string[];
    [key: string]: any;
  };

  /**
   * Calculate notice days based on tenure and contract
   */
  static calculateNoticeDays(
    tenureYears: number,
    contractualDays: number,
    country: string,
  ): { statutory: number; contractual: number; total: number } {
    let statutory = 0;

    // UK statutory notice
    if (country === 'GB') {
      if (tenureYears < 1) statutory = 7; // 1 week
      else if (tenureYears < 2) statutory = 7;
      else if (tenureYears < 12) statutory = tenureYears * 7; // 1 week per year
      else statutory = 84; // Max 12 weeks
    }
    // US at-will (no statutory)
    else if (country === 'US') {
      statutory = 0; // At-will employment
    }
    // South Africa BCEA
    else if (country === 'ZA') {
      if (tenureYears < 0.5) statutory = 7; // 1 week
      else if (tenureYears < 1) statutory = 14; // 2 weeks
      else statutory = 28; // 4 weeks
    }
    // Nigeria Labour Act
    else if (country === 'NG') {
      if (tenureYears < 1) statutory = 7;
      else if (tenureYears < 5) statutory = 14;
      else statutory = 28;
    }

    const total = Math.max(statutory, contractualDays);

    return { statutory, contractual: contractualDays, total };
  }

  /**
   * Calculate PILON amount
   */
  calculatePILON(dailyRate: number): number {
    this.pilonAmount = dailyRate * this.noticeDays;
    return this.pilonAmount;
  }
}
