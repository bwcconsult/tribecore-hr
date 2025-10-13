import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { HealthSafetyPolicy } from '../entities/health-safety-policy.entity';
import { TrainingRecord, TrainingStatus } from '../entities/training-record.entity';
import { DSEAssessment } from '../entities/dse-assessment.entity';
import { ManualHandlingAssessment } from '../entities/manual-handling-assessment.entity';
import { FireRiskAssessment } from '../entities/fire-risk-assessment.entity';
import { RIDDORReport } from '../entities/riddor-report.entity';
import { PPEManagement } from '../entities/ppe-management.entity';
import { WorkplaceInspection } from '../entities/workplace-inspection.entity';
import { HSEEnforcement } from '../entities/hse-enforcement.entity';
import {
  CreateHealthSafetyPolicyDto,
  CreateTrainingRecordDto,
  CreateDSEAssessmentDto,
  CreateManualHandlingAssessmentDto,
  CreateFireRiskAssessmentDto,
  CreateRIDDORReportDto,
  CreatePPEDto,
  IssuePPEDto,
  CreateWorkplaceInspectionDto,
  CreateHSEEnforcementDto,
} from '../dto/health-safety.dto';

@Injectable()
export class HealthSafetyEnhancedService {
  constructor(
    @InjectRepository(HealthSafetyPolicy)
    private policyRepo: Repository<HealthSafetyPolicy>,
    @InjectRepository(TrainingRecord)
    private trainingRepo: Repository<TrainingRecord>,
    @InjectRepository(DSEAssessment)
    private dseRepo: Repository<DSEAssessment>,
    @InjectRepository(ManualHandlingAssessment)
    private manualHandlingRepo: Repository<ManualHandlingAssessment>,
    @InjectRepository(FireRiskAssessment)
    private fireRiskRepo: Repository<FireRiskAssessment>,
    @InjectRepository(RIDDORReport)
    private riddorRepo: Repository<RIDDORReport>,
    @InjectRepository(PPEManagement)
    private ppeRepo: Repository<PPEManagement>,
    @InjectRepository(WorkplaceInspection)
    private inspectionRepo: Repository<WorkplaceInspection>,
    @InjectRepository(HSEEnforcement)
    private enforcementRepo: Repository<HSEEnforcement>,
  ) {}

  // ========== HEALTH & SAFETY POLICY ==========
  async createPolicy(dto: CreateHealthSafetyPolicyDto): Promise<HealthSafetyPolicy> {
    const policyNumber = `HSP-${Date.now()}`;
    const policy = this.policyRepo.create({
      ...dto,
      policyNumber,
      version: 1,
    });
    return this.policyRepo.save(policy);
  }

  async findAllPolicies(orgId: string): Promise<HealthSafetyPolicy[]> {
    return this.policyRepo.find({
      where: { organizationId: orgId },
      order: { version: 'DESC', createdAt: 'DESC' },
    });
  }

  async getActivePolicy(orgId: string): Promise<HealthSafetyPolicy | null> {
    return this.policyRepo.findOne({
      where: { organizationId: orgId, status: 'PUBLISHED' as any },
      order: { version: 'DESC' },
    });
  }

  async updatePolicy(id: string, updates: any): Promise<HealthSafetyPolicy> {
    const policy = await this.policyRepo.findOne({ where: { id } });
    if (!policy) throw new NotFoundException('Policy not found');
    Object.assign(policy, updates);
    return this.policyRepo.save(policy);
  }

  // ========== TRAINING MANAGEMENT ==========
  async createTrainingRecord(dto: CreateTrainingRecordDto): Promise<TrainingRecord> {
    const trainingNumber = `TRN-${Date.now()}`;
    
    let expiryDate: Date | undefined = undefined;
    let nextRefresherDate: Date | undefined = undefined;
    if (dto.validityMonths) {
      expiryDate = new Date(dto.trainingDate);
      expiryDate.setMonth(expiryDate.getMonth() + dto.validityMonths);
      
      nextRefresherDate = new Date(expiryDate);
      nextRefresherDate.setMonth(nextRefresherDate.getMonth() - 1); // Reminder 1 month before
    }

    const training = this.trainingRepo.create({
      ...dto,
      trainingNumber,
      expiryDate,
      nextRefresherDate,
    } as any);

    return this.trainingRepo.save(training);
  }

  async findAllTraining(orgId: string, employeeId?: string): Promise<TrainingRecord[]> {
    const where: any = { organizationId: orgId };
    if (employeeId) where.employeeId = employeeId;
    return this.trainingRepo.find({ where, order: { trainingDate: 'DESC' } });
  }

  async getExpiringTraining(orgId: string, daysAhead: number = 30): Promise<TrainingRecord[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    return this.trainingRepo.find({
      where: {
        organizationId: orgId,
        expiryDate: LessThan(futureDate),
        status: TrainingStatus.COMPLETED,
      },
      order: { expiryDate: 'ASC' },
    });
  }

  async updateTrainingRecord(id: string, updates: any): Promise<TrainingRecord> {
    const training = await this.trainingRepo.findOne({ where: { id } });
    if (!training) throw new NotFoundException('Training record not found');
    Object.assign(training, updates);
    return this.trainingRepo.save(training);
  }

  // ========== DSE ASSESSMENTS ==========
  async createDSEAssessment(dto: CreateDSEAssessmentDto): Promise<DSEAssessment> {
    const assessmentNumber = `DSE-${Date.now()}`;
    
    const nextReviewDate = new Date(dto.assessmentDate);
    nextReviewDate.setFullYear(nextReviewDate.getFullYear() + 1); // Annual review

    const assessment = this.dseRepo.create({
      ...dto,
      assessmentNumber,
      nextReviewDate,
      isHabitualUser: dto.dailyHoursAtDSE >= 1,
    } as any);

    return this.dseRepo.save(assessment);
  }

  async findAllDSEAssessments(orgId: string, employeeId?: string): Promise<DSEAssessment[]> {
    const where: any = { organizationId: orgId };
    if (employeeId) where.employeeId = employeeId;
    return this.dseRepo.find({ where, order: { assessmentDate: 'DESC' } });
  }

  async getDSEAssessmentsDueReview(orgId: string): Promise<DSEAssessment[]> {
    const today = new Date();
    return this.dseRepo.find({
      where: {
        organizationId: orgId,
        nextReviewDate: LessThan(today),
      },
    });
  }

  // ========== MANUAL HANDLING ASSESSMENTS ==========
  async createManualHandlingAssessment(dto: CreateManualHandlingAssessmentDto): Promise<ManualHandlingAssessment> {
    const assessmentNumber = `MHA-${Date.now()}`;
    
    const nextReviewDate = new Date(dto.assessmentDate);
    nextReviewDate.setFullYear(nextReviewDate.getFullYear() + 1);

    const assessment = this.manualHandlingRepo.create({
      ...dto,
      assessmentNumber,
      nextReviewDate,
    } as any);

    return this.manualHandlingRepo.save(assessment);
  }

  async findAllManualHandlingAssessments(orgId: string): Promise<ManualHandlingAssessment[]> {
    return this.manualHandlingRepo.find({
      where: { organizationId: orgId },
      order: { assessmentDate: 'DESC' },
    });
  }

  // ========== FIRE RISK ASSESSMENTS ==========
  async createFireRiskAssessment(dto: CreateFireRiskAssessmentDto): Promise<FireRiskAssessment> {
    const assessmentNumber = `FRA-${Date.now()}`;
    
    const nextReviewDate = new Date(dto.assessmentDate);
    nextReviewDate.setFullYear(nextReviewDate.getFullYear() + 1);

    const assessment = this.fireRiskRepo.create({
      ...dto,
      assessmentNumber,
      nextReviewDate,
    } as any);

    return this.fireRiskRepo.save(assessment);
  }

  async findAllFireRiskAssessments(orgId: string): Promise<FireRiskAssessment[]> {
    return this.fireRiskRepo.find({
      where: { organizationId: orgId },
      order: { assessmentDate: 'DESC' },
    });
  }

  // ========== RIDDOR REPORTING ==========
  async createRIDDORReport(dto: CreateRIDDORReportDto): Promise<RIDDORReport> {
    const riddorNumber = `RIDDOR-${Date.now()}`;
    
    const incidentDate = new Date(dto.incidentDateTime);
    const reportDate = new Date(dto.reportDate);
    const daysDifference = Math.floor((reportDate.getTime() - incidentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const reportedWithin10Days = daysDifference <= 10;
    const reportedWithin15Days = daysDifference <= 15;

    const report = this.riddorRepo.create({
      ...dto,
      riddorNumber,
      reportedWithin10Days,
      reportedWithin15Days,
    } as any);

    return this.riddorRepo.save(report);
  }

  async findAllRIDDORReports(orgId: string): Promise<RIDDORReport[]> {
    return this.riddorRepo.find({
      where: { organizationId: orgId },
      order: { incidentDateTime: 'DESC' },
    });
  }

  async updateRIDDORReport(id: string, updates: any): Promise<RIDDORReport> {
    const report = await this.riddorRepo.findOne({ where: { id } });
    if (!report) throw new NotFoundException('RIDDOR report not found');
    Object.assign(report, updates);
    return this.riddorRepo.save(report);
  }

  // ========== PPE MANAGEMENT ==========
  async createPPE(dto: CreatePPEDto): Promise<PPEManagement> {
    const ppeNumber = `PPE-${Date.now()}`;
    const ppe = this.ppeRepo.create({
      ...dto,
      ppeNumber,
    } as any);
    return this.ppeRepo.save(ppe);
  }

  async issuePPE(id: string, issueDto: IssuePPEDto): Promise<PPEManagement> {
    const ppe = await this.ppeRepo.findOne({ where: { id } });
    if (!ppe) throw new NotFoundException('PPE not found');

    if (ppe.quantityInStock < issueDto.quantity) {
      throw new Error('Insufficient stock');
    }

    const issueRecord = {
      ...issueDto,
      dateIssued: new Date(),
      conditionOnIssue: 'NEW',
      signatureReceived: false,
    };

    if (!ppe.issueRecords) ppe.issueRecords = [];
    ppe.issueRecords.push(issueRecord);
    ppe.quantityInStock -= issueDto.quantity;

    if (ppe.quantityInStock <= ppe.minimumStockLevel) {
      ppe.status = 'NEEDS_REPLACEMENT' as any;
    }

    return this.ppeRepo.save(ppe);
  }

  async findAllPPE(orgId: string): Promise<PPEManagement[]> {
    return this.ppeRepo.find({
      where: { organizationId: orgId },
      order: { createdAt: 'DESC' },
    });
  }

  async getLowStockPPE(orgId: string): Promise<PPEManagement[]> {
    const allPPE = await this.ppeRepo.find({ where: { organizationId: orgId } });
    return allPPE.filter(ppe => ppe.quantityInStock <= ppe.minimumStockLevel);
  }

  // ========== WORKPLACE INSPECTIONS ==========
  async createInspection(dto: CreateWorkplaceInspectionDto): Promise<WorkplaceInspection> {
    const inspectionNumber = `INSP-${Date.now()}`;
    
    const totalItems = dto.checklist.length;
    const compliantItems = dto.checklist.filter(item => item.compliant).length;
    const nonCompliantItems = totalItems - compliantItems;
    const complianceScore = totalItems > 0 ? (compliantItems / totalItems) * 100 : 0;

    const inspection = this.inspectionRepo.create({
      ...dto,
      inspectionNumber,
      totalItems,
      compliantItems,
      nonCompliantItems,
      complianceScore,
    } as any);

    return this.inspectionRepo.save(inspection);
  }

  async findAllInspections(orgId: string): Promise<WorkplaceInspection[]> {
    return this.inspectionRepo.find({
      where: { organizationId: orgId },
      order: { inspectionDate: 'DESC' },
    });
  }

  // ========== HSE ENFORCEMENT ==========
  async createEnforcementNotice(dto: CreateHSEEnforcementDto): Promise<HSEEnforcement> {
    const noticeNumber = `HSE-${Date.now()}`;
    
    const issuedDate = new Date(dto.issuedDate);
    const complianceDeadline = new Date(dto.complianceDeadline);
    const daysToComply = Math.floor((complianceDeadline.getTime() - issuedDate.getTime()) / (1000 * 60 * 60 * 24));

    const notice = this.enforcementRepo.create({
      ...dto,
      noticeNumber,
      daysToComply,
      isProhibitionNotice: dto.type === 'PROHIBITION_NOTICE',
      isImprovementNotice: dto.type === 'IMPROVEMENT_NOTICE',
    } as any);

    return this.enforcementRepo.save(notice);
  }

  async findAllEnforcementNotices(orgId: string): Promise<HSEEnforcement[]> {
    return this.enforcementRepo.find({
      where: { organizationId: orgId },
      order: { issuedDate: 'DESC' },
    });
  }

  async updateEnforcementNotice(id: string, updates: any): Promise<HSEEnforcement> {
    const notice = await this.enforcementRepo.findOne({ where: { id } });
    if (!notice) throw new NotFoundException('Enforcement notice not found');
    Object.assign(notice, updates);
    return this.enforcementRepo.save(notice);
  }

  // ========== COMPREHENSIVE DASHBOARD ==========
  async getComplianceDashboard(orgId: string) {
    const [
      policies,
      trainingExpiring,
      dseOverdue,
      riddorReports,
      lowStockPPE,
      enforcementNotices,
      inspections,
    ] = await Promise.all([
      this.policyRepo.count({ where: { organizationId: orgId } }),
      this.getExpiringTraining(orgId, 30),
      this.getDSEAssessmentsDueReview(orgId),
      this.riddorRepo.count({ where: { organizationId: orgId } }),
      this.getLowStockPPE(orgId),
      this.enforcementRepo.count({ where: { organizationId: orgId, status: 'IN_PROGRESS' as any } }),
      this.inspectionRepo.find({ where: { organizationId: orgId }, order: { inspectionDate: 'DESC' }, take: 5 }),
    ]);

    const avgComplianceScore = inspections.length > 0
      ? inspections.reduce((sum, i) => sum + (i as any).complianceScore, 0) / inspections.length
      : 0;

    return {
      policies,
      trainingExpiringCount: trainingExpiring.length,
      dseOverdueCount: dseOverdue.length,
      riddorReports,
      lowStockPPECount: lowStockPPE.length,
      activeEnforcementNotices: enforcementNotices,
      averageComplianceScore: Math.round(avgComplianceScore),
      recentInspections: inspections,
    };
  }
}
