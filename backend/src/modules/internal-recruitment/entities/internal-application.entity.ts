import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  MANAGER_REVIEW = 'MANAGER_REVIEW',
  MANAGER_APPROVED = 'MANAGER_APPROVED',
  MANAGER_DECLINED = 'MANAGER_DECLINED',
  HR_REVIEW = 'HR_REVIEW',
  HIRING_MANAGER_REVIEW = 'HIRING_MANAGER_REVIEW',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEWED = 'INTERVIEWED',
  OFFER_PENDING = 'OFFER_PENDING',
  OFFER_EXTENDED = 'OFFER_EXTENDED',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_DECLINED = 'OFFER_DECLINED',
  TRANSFERRED = 'TRANSFERRED',
  WITHDRAWN = 'WITHDRAWN',
  REJECTED = 'REJECTED',
}

@Entity('internal_applications')
@Index(['employeeId'])
@Index(['jobPostingId'])
@Index(['status'])
@Index(['appliedDate'])
export class InternalApplication extends BaseEntity {
  @Column()
  organizationId: string;

  @Column()
  applicationNumber: string;

  @Column()
  jobPostingId: string;

  @Column()
  employeeId: string;

  @Column()
  employeeName: string;

  @Column()
  currentDepartmentId: string;

  @Column()
  currentDepartmentName: string;

  @Column()
  currentJobTitle: string;

  @Column({ nullable: true })
  currentManagerId: string;

  @Column({ nullable: true })
  currentManagerName: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.DRAFT,
  })
  status: ApplicationStatus;

  @Column({ type: 'date' })
  appliedDate: Date;

  @Column({ type: 'text', nullable: true })
  coverLetter: string;

  @Column({ type: 'text', nullable: true })
  whyInterested: string;

  @Column({ type: 'text', nullable: true })
  relevantExperience: string;

  @Column({ type: 'jsonb', nullable: true })
  skillsMatch: {
    matchedSkills: Array<{
      skillId: string;
      skillName: string;
      hasSkill: boolean;
      proficiencyLevel?: string;
    }>;
    matchPercentage: number;
  };

  @Column({ type: 'int', nullable: true })
  yearsWithCompany: number;

  @Column({ type: 'int', nullable: true })
  monthsInCurrentRole: number;

  @Column({ nullable: true })
  currentPerformanceRating: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  currentPerformanceScore: number;

  @Column({ type: 'jsonb', nullable: true })
  managerApproval: {
    status: 'PENDING' | 'APPROVED' | 'DECLINED';
    approvedBy?: string;
    approvalDate?: Date;
    comments?: string;
    willingToRelease?: boolean;
    recommendedTransferDate?: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  hrApproval: {
    status: 'PENDING' | 'APPROVED' | 'DECLINED';
    approvedBy?: string;
    approvalDate?: Date;
    comments?: string;
    eligibilityVerified?: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  hiringManagerReview: {
    status: 'PENDING' | 'SHORTLISTED' | 'REJECTED';
    reviewedBy?: string;
    reviewDate?: Date;
    rating?: number;
    feedback?: string;
    strengths?: string[];
    concerns?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  interviews: Array<{
    id: string;
    interviewerId: string;
    interviewerName: string;
    scheduledDate: Date;
    completedDate?: Date;
    rating?: number;
    feedback?: string;
    recommendation?: 'STRONG_YES' | 'YES' | 'MAYBE' | 'NO' | 'STRONG_NO';
  }>;

  @Column({ type: 'jsonb', nullable: true })
  assessments: Array<{
    assessmentType: string;
    score: number;
    completedDate: Date;
    feedback?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  offerDetails: {
    offeredPosition?: string;
    offeredDepartment?: string;
    offeredSalary?: number;
    startDate?: Date;
    offeredBy?: string;
    offeredDate?: Date;
    acceptedDate?: Date;
    declinedDate?: Date;
    declineReason?: string;
  };

  @Column({ type: 'date', nullable: true })
  transferDate: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'text', nullable: true })
  withdrawalReason: string;

  @Column({ type: 'boolean', default: false })
  isConfidential: boolean;

  @Column({ type: 'jsonb', nullable: true })
  timeline: Array<{
    stage: string;
    status: string;
    date: Date;
    actor?: string;
    notes?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  documents: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedDate: Date;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    sourceType?: 'DIRECT_APPLY' | 'MANAGER_NOMINATION' | 'SUCCESSION_PLAN' | 'TALENT_REVIEW';
    referralBy?: string;
    talentPoolId?: string;
    [key: string]: any;
  };
}
