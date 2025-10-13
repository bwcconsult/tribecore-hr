// Health & Safety Policy DTOs
export class CreateHealthSafetyPolicyDto {
  organizationId: string;
  title: string;
  generalStatement: string;
  responsibilities: Array<{
    role: string;
    name: string;
    duties: string[];
    contactDetails?: string;
  }>;
  arrangements: Array<{
    area: string;
    description: string;
    procedures: string[];
    responsiblePerson: string;
    reviewFrequency: string;
  }>;
  ceoSignatory: string;
  signatureDate: Date;
  issueDate: Date;
  nextReviewDate: Date;
  authoredBy: string;
}

export class UpdateHealthSafetyPolicyDto {
  status?: string;
  reviewedBy?: string;
  approvedBy?: string;
  nextReviewDate?: Date;
}

// Training Record DTOs
export class CreateTrainingRecordDto {
  organizationId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  jobRole: string;
  trainingType: string;
  trainingTitle: string;
  provider: string;
  trainer?: string;
  trainingDate: Date;
  durationHours: number;
  validityMonths?: number;
}

export class UpdateTrainingRecordDto {
  status?: string;
  completionDate?: Date;
  certificateIssued?: boolean;
  certificateNumber?: string;
  expiryDate?: Date;
  assessmentResults?: any;
}

// DSE Assessment DTOs
export class CreateDSEAssessmentDto {
  organizationId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  workstation: string;
  assessmentDate: Date;
  assessor: string;
  dailyHoursAtDSE: number;
  displayScreen: any;
  keyboardMouse: any;
  desk: any;
  chair: any;
  environment: any;
  software: any;
  overallRisk: string;
  actions: any[];
}

export class UpdateDSEAssessmentDto {
  status?: string;
  nextReviewDate?: Date;
  dseTrainingCompleted?: boolean;
  userSelfAssessmentCompleted?: boolean;
}

// Manual Handling Assessment DTOs
export class CreateManualHandlingAssessmentDto {
  organizationId: string;
  taskDescription: string;
  location: string;
  department: string;
  personsAtRisk: string[];
  assessor: string;
  assessmentDate: Date;
  taskDetails: any;
  taskRisks: any;
  individualRisks: any;
  loadRisks: any;
  environmentRisks: any;
  overallRisk: string;
  totalRiskScore: number;
  controlMeasures: any;
}

export class UpdateManualHandlingAssessmentDto {
  status?: string;
  nextReviewDate?: Date;
  trainingRequired?: boolean;
  residualRisk?: string;
  approvedBy?: string;
}

// Fire Risk Assessment DTOs
export class CreateFireRiskAssessmentDto {
  organizationId: string;
  premises: string;
  address: string;
  numberOfFloors: number;
  maxOccupancy: number;
  assessor: string;
  assessmentDate: Date;
  peopleAtRisk: any;
  fireHazards: any[];
  detectionWarning: any;
  meansOfEscape: any[];
  fireFightingEquipment: any;
  emergencyPlan: string;
  evacuationProcedures: any;
  managementArrangements: any;
  overallRisk: string;
  actions: any[];
}

export class UpdateFireRiskAssessmentDto {
  status?: string;
  nextReviewDate?: Date;
  approvedBy?: string;
}

// RIDDOR Report DTOs
export class CreateRIDDORReportDto {
  organizationId: string;
  incidentId: string;
  category: string;
  incidentDateTime: Date;
  reportedBy: string;
  reportDate: Date;
  affectedPerson: any;
  location: string;
  detailedDescription: string;
  activityAtTime: string;
  injuryDetails?: string;
  daysOffWork?: number;
}

export class UpdateRIDDORReportDto {
  status?: string;
  hseReference?: string;
  reportedWithin10Days?: boolean;
  investigationOfficer?: string;
  investigationFindings?: string;
  complianceAchieved?: boolean;
}

// PPE Management DTOs
export class CreatePPEDto {
  organizationId: string;
  ppeType: string;
  description: string;
  manufacturer?: string;
  quantityInStock: number;
  minimumStockLevel: number;
  unitCost: number;
  supplier?: string;
  storageLocation?: string;
}

export class IssuePPEDto {
  employeeId: string;
  employeeName: string;
  quantity: number;
  size?: string;
  issuedBy: string;
}

export class UpdatePPEDto {
  status?: string;
  quantityInStock?: number;
  requiresReplacement?: boolean;
  lastInspectionDate?: Date;
}

// Workplace Inspection DTOs
export class CreateWorkplaceInspectionDto {
  organizationId: string;
  type: string;
  location: string;
  area?: string;
  department?: string;
  inspector: string;
  inspectionDate: Date;
  frequency: string;
  checklist: any[];
}

export class UpdateWorkplaceInspectionDto {
  status?: string;
  hazardsIdentified?: any[];
  actions?: any[];
  complianceScore?: number;
  overallRating?: string;
  reviewedBy?: string;
}

// HSE Enforcement DTOs
export class CreateHSEEnforcementDto {
  organizationId: string;
  type: string;
  severity: string;
  issuedDate: Date;
  issuedBy: string;
  location: string;
  specificLocation: string;
  breachDescription: string;
  contravention: string;
  legislationBreached: string[];
  reasonForNotice: string;
  requiredActions: any[];
  complianceDeadline: Date;
}

export class UpdateHSEEnforcementDto {
  status?: string;
  responsiblePerson?: string;
  actionPlan?: any[];
  complianceAchieved?: boolean;
  complianceDate?: Date;
  appealLodged?: boolean;
}
