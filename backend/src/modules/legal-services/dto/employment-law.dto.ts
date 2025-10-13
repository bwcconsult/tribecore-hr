import { ProtectedCharacteristic, DiscriminationType } from '../entities/equality-case.entity';
import { WorkingTimeViolationType } from '../entities/working-time-compliance.entity';
import { RedundancyReason, ConsultationType } from '../entities/redundancy-process.entity';
import { WhistleblowingCategory } from '../entities/whistleblowing-case.entity';
import { ContractType } from '../entities/employment-contract.entity';
import { FamilyLeaveType } from '../entities/family-leave.entity';
import { DataRequestType, DataBreachSeverity } from '../entities/gdpr-compliance.entity';

// Equality Case DTOs
export class CreateEqualityCaseDto {
  organizationId: string;
  employeeId: string;
  reportedBy: string;
  protectedCharacteristic: ProtectedCharacteristic;
  discriminationType: DiscriminationType;
  incidentDate: Date;
  description: string;
  witnessStatements?: string;
  witnesses?: string[];
  allegedDiscriminator?: string;
}

export class UpdateEqualityCaseDto {
  status?: string;
  investigator?: string;
  investigationStartDate?: Date;
  investigationFindings?: string;
  actionsTaken?: string;
  escalatedToTribunal?: boolean;
  tribunalDate?: Date;
  outcome?: string;
  compensationAmount?: number;
}

// Working Time Compliance DTOs
export class CreateWorkingTimeComplianceDto {
  organizationId: string;
  employeeId: string;
  weekStartDate: Date;
  weekEndDate: Date;
  totalHoursWorked: number;
  averageWeeklyHours: number;
  hasOptedOut?: boolean;
  optOutDate?: Date;
  isNightWorker?: boolean;
  nightHoursWorked?: number;
}

export class ReportViolationDto {
  type: WorkingTimeViolationType;
  date: Date;
  details: string;
}

// Redundancy Process DTOs
export class CreateRedundancyProcessDto {
  organizationId: string;
  reason: RedundancyReason;
  businessJustification: string;
  proposedRedundancies: number;
  proposedStartDate: Date;
  consultationType: ConsultationType;
  consultationDays?: number;
  leadHRContact: string;
}

export class UpdateRedundancyProcessDto {
  status?: string;
  consultationStartDate?: Date;
  consultationEndDate?: Date;
  hr1FormSubmitted?: boolean;
  hr1SubmissionDate?: Date;
  notes?: string;
}

export class AddSelectionPoolDto {
  employeeId: string;
  employeeName: string;
  role: string;
  department: string;
}

export class SetSelectionCriteriaDto {
  criteria: Array<{
    criterion: string;
    weight: number;
    description: string;
  }>;
}

export class ScoreEmployeeDto {
  employeeId: string;
  scores: Record<string, number>;
  totalScore: number;
  selected: boolean;
}

export class OfferAlternativeRoleDto {
  roleId: string;
  roleTitle: string;
  offeredTo: string[];
  suitability: string;
}

export class CalculateRedundancyPayDto {
  employeeId: string;
  serviceYears: number;
  weeklyPay: number;
  statutoryAmount: number;
  enhancedAmount?: number;
}

// Whistleblowing DTOs
export class CreateWhistleblowingCaseDto {
  organizationId: string;
  reporterId?: string;
  isAnonymous: boolean;
  category: WhistleblowingCategory;
  incidentDate: Date;
  disclosure: string;
  publicInterestRationale?: string;
  individualsInvolved?: string[];
  departments?: string[];
}

export class UpdateWhistleblowingCaseDto {
  status?: string;
  investigator?: string;
  investigationStartDate?: Date;
  investigationEndDate?: Date;
  investigationFindings?: string;
  actionsTaken?: string;
  substantiated?: boolean;
  reportedToAuthorities?: boolean;
  authoritiesNotified?: string[];
}

// Employment Contract DTOs
export class CreateEmploymentContractDto {
  organizationId: string;
  employeeId: string;
  contractType: ContractType;
  startDate: Date;
  endDate?: Date;
  jobTitle: string;
  department: string;
  reportingTo?: string;
  workLocation: string;
  salary: number;
  currency?: string;
  salaryPeriod: string;
  hoursPerWeek: number;
  annualLeaveEntitlement: number;
  noticePeriodDays?: number;
  probationPeriodDays?: number;
  contractTemplateId?: string;
  createdBy: string;
}

export class UpdateEmploymentContractDto {
  status?: string;
  jobTitle?: string;
  salary?: number;
  hoursPerWeek?: number;
  department?: string;
  workLocation?: string;
}

// Minimum Wage Compliance DTOs
export class CheckMinimumWageDto {
  organizationId: string;
  employeeId: string;
  payPeriodStart: Date;
  payPeriodEnd: Date;
  employeeAge: number;
  totalHoursWorked: number;
  grossPay: number;
  allowableDeductions?: number;
  isApprentice?: boolean;
}

// Family Leave DTOs
export class CreateFamilyLeaveDto {
  organizationId: string;
  employeeId: string;
  leaveType: FamilyLeaveType;
  expectedStartDate: Date;
  expectedReturnDate: Date;
  dueDate?: Date;
  totalWeeksEntitled: number;
  paidWeeks: number;
  unpaidWeeks: number;
  isSharedParentalLeave?: boolean;
  partnerEmployeeId?: string;
}

export class UpdateFamilyLeaveDto {
  status?: string;
  actualStartDate?: Date;
  actualReturnDate?: Date;
  childBirthDate?: Date;
  weeksTaken?: number;
  approvedBy?: string;
  approvalDate?: Date;
}

// GDPR DTOs
export class CreateGDPRDataRequestDto {
  organizationId: string;
  employeeId: string;
  requestType: DataRequestType;
  requestDetails: string;
}

export class CreateGDPRDataBreachDto {
  organizationId: string;
  breachDate: Date;
  discoveryDate: Date;
  severity: DataBreachSeverity;
  description: string;
  affectedEmployees?: string[];
  numberOfIndividualsAffected: number;
  dataCategories: string;
  likelyConsequences: string;
  measuresTaken: string;
}

// Agency Worker DTOs
export class CreateAgencyWorkerDto {
  organizationId: string;
  workerId: string;
  agencyName: string;
  agencyContact?: string;
  assignmentStartDate: Date;
  role: string;
  department: string;
  hourlyRate: number;
  comparableEmployeeRate?: number;
}

export class UpdateAgencyWorkerDto {
  status?: string;
  weeksWorked?: number;
  equalTreatmentApplied?: boolean;
  hourlyRate?: number;
  payParityAchieved?: boolean;
}
