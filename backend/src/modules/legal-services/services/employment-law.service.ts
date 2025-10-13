import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EqualityCase } from '../entities/equality-case.entity';
import { WorkingTimeCompliance, ComplianceStatus, WorkingTimeViolationType } from '../entities/working-time-compliance.entity';
import { RedundancyProcess, RedundancyStage } from '../entities/redundancy-process.entity';
import { WhistleblowingCase } from '../entities/whistleblowing-case.entity';
import { EmploymentContract } from '../entities/employment-contract.entity';
import { MinimumWageCompliance, WageAgeCategory, MinimumWageStatus } from '../entities/minimum-wage-compliance.entity';
import { FamilyLeave } from '../entities/family-leave.entity';
import { GDPRDataRequest, GDPRDataBreach } from '../entities/gdpr-compliance.entity';
import { AgencyWorker, AgencyWorkerStatus } from '../entities/agency-worker.entity';
import {
  CreateEqualityCaseDto,
  UpdateEqualityCaseDto,
  CreateWorkingTimeComplianceDto,
  CreateRedundancyProcessDto,
  UpdateRedundancyProcessDto,
  AddSelectionPoolDto,
  SetSelectionCriteriaDto,
  ScoreEmployeeDto,
  OfferAlternativeRoleDto,
  CalculateRedundancyPayDto,
  CreateWhistleblowingCaseDto,
  UpdateWhistleblowingCaseDto,
  CreateEmploymentContractDto,
  UpdateEmploymentContractDto,
  CheckMinimumWageDto,
  CreateFamilyLeaveDto,
  UpdateFamilyLeaveDto,
  CreateGDPRDataRequestDto,
  CreateGDPRDataBreachDto,
  CreateAgencyWorkerDto,
  UpdateAgencyWorkerDto,
} from '../dto/employment-law.dto';

@Injectable()
export class EmploymentLawService {
  constructor(
    @InjectRepository(EqualityCase)
    private equalityCaseRepo: Repository<EqualityCase>,
    @InjectRepository(WorkingTimeCompliance)
    private workingTimeRepo: Repository<WorkingTimeCompliance>,
    @InjectRepository(RedundancyProcess)
    private redundancyRepo: Repository<RedundancyProcess>,
    @InjectRepository(WhistleblowingCase)
    private whistleblowingRepo: Repository<WhistleblowingCase>,
    @InjectRepository(EmploymentContract)
    private contractRepo: Repository<EmploymentContract>,
    @InjectRepository(MinimumWageCompliance)
    private minimumWageRepo: Repository<MinimumWageCompliance>,
    @InjectRepository(FamilyLeave)
    private familyLeaveRepo: Repository<FamilyLeave>,
    @InjectRepository(GDPRDataRequest)
    private gdprRequestRepo: Repository<GDPRDataRequest>,
    @InjectRepository(GDPRDataBreach)
    private gdprBreachRepo: Repository<GDPRDataBreach>,
    @InjectRepository(AgencyWorker)
    private agencyWorkerRepo: Repository<AgencyWorker>,
  ) {}

  // ========== EQUALITY & DISCRIMINATION ==========
  async createEqualityCase(dto: CreateEqualityCaseDto): Promise<EqualityCase> {
    const caseNumber = `EQ-${Date.now()}`;
    const equalityCase = this.equalityCaseRepo.create({
      ...dto,
      caseNumber,
      timeline: [{
        date: new Date(),
        event: 'Case Reported',
        description: 'Equality case created',
        performedBy: dto.reportedBy,
      }],
    });
    return this.equalityCaseRepo.save(equalityCase);
  }

  async updateEqualityCase(id: string, dto: UpdateEqualityCaseDto, updatedBy: string): Promise<EqualityCase> {
    const equalityCase = await this.equalityCaseRepo.findOne({ where: { id } });
    if (!equalityCase) throw new NotFoundException('Equality case not found');

    Object.assign(equalityCase, dto);
    
    if (!equalityCase.timeline) equalityCase.timeline = [];
    equalityCase.timeline.push({
      date: new Date(),
      event: 'Case Updated',
      description: `Status: ${dto.status || 'Updated'}`,
      performedBy: updatedBy,
    });

    return this.equalityCaseRepo.save(equalityCase);
  }

  async findAllEqualityCases(orgId: string): Promise<EqualityCase[]> {
    return this.equalityCaseRepo.find({
      where: { organizationId: orgId },
      order: { createdAt: 'DESC' },
    });
  }

  async getEqualityCase(id: string): Promise<EqualityCase> {
    const equalityCase = await this.equalityCaseRepo.findOne({ where: { id } });
    if (!equalityCase) throw new NotFoundException('Equality case not found');
    return equalityCase;
  }

  async addReasonableAdjustments(id: string, adjustment: any): Promise<EqualityCase> {
    const equalityCase = await this.getEqualityCase(id);
    if (!equalityCase.reasonableAdjustments) {
      equalityCase.reasonableAdjustments = [];
    }
    equalityCase.reasonableAdjustments.push(adjustment);
    return this.equalityCaseRepo.save(equalityCase);
  }

  // ========== WORKING TIME REGULATIONS ==========
  async createWorkingTimeCompliance(dto: CreateWorkingTimeComplianceDto): Promise<WorkingTimeCompliance> {
    const violations: Array<{
      type: WorkingTimeViolationType;
      date: Date;
      details: string;
      resolved: boolean;
      resolvedDate?: Date;
    }> = [];
    
    // Check 48-hour week limit
    if (!dto.hasOptedOut && dto.totalHoursWorked > 48) {
      violations.push({
        type: WorkingTimeViolationType.EXCEEDS_48_HOURS,
        date: new Date(),
        details: `Worked ${dto.totalHoursWorked} hours without opt-out`,
        resolved: false,
      });
    }

    // Check night work limits
    if (dto.isNightWorker && dto.nightHoursWorked && dto.nightHoursWorked > 8) {
      violations.push({
        type: WorkingTimeViolationType.NIGHT_WORK_LIMIT_EXCEEDED,
        date: new Date(),
        details: `Night hours: ${dto.nightHoursWorked}`,
        resolved: false,
      });
    }

    const compliance = this.workingTimeRepo.create({
      ...dto,
      violations: violations.length > 0 ? violations : undefined,
      complianceStatus: violations.length > 0 ? ComplianceStatus.VIOLATION : ComplianceStatus.COMPLIANT,
    });

    return this.workingTimeRepo.save(compliance);
  }

  async findWorkingTimeCompliance(orgId: string, employeeId?: string): Promise<WorkingTimeCompliance[]> {
    const where: any = { organizationId: orgId };
    if (employeeId) where.employeeId = employeeId;
    return this.workingTimeRepo.find({ where, order: { weekStartDate: 'DESC' } });
  }

  async getWorkingTimeViolations(orgId: string): Promise<WorkingTimeCompliance[]> {
    return this.workingTimeRepo.find({
      where: { organizationId: orgId, complianceStatus: ComplianceStatus.VIOLATION },
      order: { weekStartDate: 'DESC' },
    });
  }

  // ========== REDUNDANCY PROCESS ==========
  async createRedundancyProcess(dto: CreateRedundancyProcessDto): Promise<RedundancyProcess> {
    const processNumber = `RED-${Date.now()}`;
    
    const process = this.redundancyRepo.create({
      ...dto,
      processNumber,
      timeline: [{
        date: new Date(),
        stage: 'PLANNING',
        event: 'Redundancy Process Initiated',
        performedBy: dto.leadHRContact,
        notes: dto.businessJustification,
      }],
    });

    return this.redundancyRepo.save(process);
  }

  async updateRedundancyProcess(id: string, dto: UpdateRedundancyProcessDto, updatedBy: string): Promise<RedundancyProcess> {
    const process = await this.redundancyRepo.findOne({ where: { id } });
    if (!process) throw new NotFoundException('Redundancy process not found');

    Object.assign(process, dto);
    
    if (!process.timeline) process.timeline = [];
    process.timeline.push({
      date: new Date(),
      stage: dto.status || process.status,
      event: 'Process Updated',
      performedBy: updatedBy,
      notes: dto.notes || '',
    });

    return this.redundancyRepo.save(process);
  }

  async addSelectionPool(id: string, dto: AddSelectionPoolDto): Promise<RedundancyProcess> {
    const process = await this.redundancyRepo.findOne({ where: { id } });
    if (!process) throw new NotFoundException('Redundancy process not found');

    if (!process.selectionPool) process.selectionPool = [];
    process.selectionPool.push({
      ...dto,
      addedDate: new Date(),
    });

    process.status = RedundancyStage.SELECTION_POOL_DEFINED;
    return this.redundancyRepo.save(process);
  }

  async setSelectionCriteria(id: string, dto: SetSelectionCriteriaDto): Promise<RedundancyProcess> {
    const process = await this.redundancyRepo.findOne({ where: { id } });
    if (!process) throw new NotFoundException('Redundancy process not found');

    process.selectionCriteria = dto.criteria;
    process.status = RedundancyStage.CRITERIA_SET;
    return this.redundancyRepo.save(process);
  }

  async scoreEmployee(id: string, dto: ScoreEmployeeDto): Promise<RedundancyProcess> {
    const process = await this.redundancyRepo.findOne({ where: { id } });
    if (!process) throw new NotFoundException('Redundancy process not found');

    if (!process.selectionScores) process.selectionScores = [];
    
    const existingIndex = process.selectionScores.findIndex(s => s.employeeId === dto.employeeId);
    if (existingIndex >= 0) {
      process.selectionScores[existingIndex] = dto;
    } else {
      process.selectionScores.push(dto);
    }

    return this.redundancyRepo.save(process);
  }

  async offerAlternativeRole(id: string, dto: OfferAlternativeRoleDto): Promise<RedundancyProcess> {
    const process = await this.redundancyRepo.findOne({ where: { id } });
    if (!process) throw new NotFoundException('Redundancy process not found');

    if (!process.alternativeRoles) process.alternativeRoles = [];
    process.alternativeRoles.push(dto);
    process.status = RedundancyStage.ALTERNATIVE_EMPLOYMENT_OFFERED;

    return this.redundancyRepo.save(process);
  }

  async calculateRedundancyPay(id: string, dto: CalculateRedundancyPayDto): Promise<RedundancyProcess> {
    const process = await this.redundancyRepo.findOne({ where: { id } });
    if (!process) throw new NotFoundException('Redundancy process not found');

    const totalAmount = dto.statutoryAmount + (dto.enhancedAmount || 0);
    
    if (!process.redundancyPayments) process.redundancyPayments = [];
    process.redundancyPayments.push({
      employeeId: dto.employeeId,
      serviceYears: dto.serviceYears,
      weeklyPay: dto.weeklyPay,
      statutoryAmount: dto.statutoryAmount,
      enhancedAmount: dto.enhancedAmount || 0,
      totalAmount,
      paymentDate: new Date(),
    });

    return this.redundancyRepo.save(process);
  }

  async findAllRedundancyProcesses(orgId: string): Promise<RedundancyProcess[]> {
    return this.redundancyRepo.find({
      where: { organizationId: orgId },
      order: { createdAt: 'DESC' },
    });
  }

  // ========== WHISTLEBLOWING ==========
  async createWhistleblowingCase(dto: CreateWhistleblowingCaseDto): Promise<WhistleblowingCase> {
    const caseNumber = `WB-${Date.now()}`;
    
    const whistleblowingCase = this.whistleblowingRepo.create({
      ...dto,
      caseNumber,
      timeline: [{
        date: new Date(),
        event: 'Disclosure Submitted',
        description: 'Whistleblowing case created',
        performedBy: dto.isAnonymous ? 'Anonymous' : dto.reporterId || 'Unknown',
      }],
    });

    return this.whistleblowingRepo.save(whistleblowingCase);
  }

  async updateWhistleblowingCase(id: string, dto: UpdateWhistleblowingCaseDto, updatedBy: string): Promise<WhistleblowingCase> {
    const whistleblowingCase = await this.whistleblowingRepo.findOne({ where: { id } });
    if (!whistleblowingCase) throw new NotFoundException('Whistleblowing case not found');

    Object.assign(whistleblowingCase, dto);
    
    if (!whistleblowingCase.timeline) whistleblowingCase.timeline = [];
    whistleblowingCase.timeline.push({
      date: new Date(),
      event: 'Case Updated',
      description: dto.status || 'Updated',
      performedBy: updatedBy,
    });

    return this.whistleblowingRepo.save(whistleblowingCase);
  }

  async findAllWhistleblowingCases(orgId: string): Promise<WhistleblowingCase[]> {
    return this.whistleblowingRepo.find({
      where: { organizationId: orgId },
      order: { createdAt: 'DESC' },
    });
  }

  // ========== EMPLOYMENT CONTRACTS ==========
  async createEmploymentContract(dto: CreateEmploymentContractDto): Promise<EmploymentContract> {
    const contractNumber = `EMP-${Date.now()}`;
    
    const contract = this.contractRepo.create({
      ...dto,
      contractNumber,
    });

    if (dto.probationPeriodDays) {
      const probationEndDate = new Date(dto.startDate);
      probationEndDate.setDate(probationEndDate.getDate() + dto.probationPeriodDays);
      contract.probationEndDate = probationEndDate;
    }

    return this.contractRepo.save(contract);
  }

  async updateEmploymentContract(id: string, dto: UpdateEmploymentContractDto, updatedBy: string): Promise<EmploymentContract> {
    const contract = await this.contractRepo.findOne({ where: { id } });
    if (!contract) throw new NotFoundException('Contract not found');

    const changes = Object.keys(dto).map(key => `${key}: ${dto[key]}`).join(', ');
    
    if (!contract.amendments) contract.amendments = [];
    contract.amendments.push({
      date: new Date(),
      amendedBy: updatedBy,
      changes,
      reason: 'Contract amendment',
    });

    Object.assign(contract, dto);
    return this.contractRepo.save(contract);
  }

  async findAllContracts(orgId: string, employeeId?: string): Promise<EmploymentContract[]> {
    const where: any = { organizationId: orgId };
    if (employeeId) where.employeeId = employeeId;
    return this.contractRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async getContract(id: string): Promise<EmploymentContract> {
    const contract = await this.contractRepo.findOne({ where: { id } });
    if (!contract) throw new NotFoundException('Contract not found');
    return contract;
  }

  // ========== MINIMUM WAGE COMPLIANCE ==========
  async checkMinimumWage(dto: CheckMinimumWageDto): Promise<MinimumWageCompliance> {
    // Get applicable minimum wage based on age
    const minimumWageRates = {
      [WageAgeCategory.APPRENTICE]: 6.40,
      [WageAgeCategory.AGE_16_17]: 6.40,
      [WageAgeCategory.AGE_18_20]: 8.60,
      [WageAgeCategory.AGE_21_PLUS]: 11.44, // National Living Wage 2025
    };

    let ageCategory: WageAgeCategory;
    if (dto.isApprentice) {
      ageCategory = WageAgeCategory.APPRENTICE;
    } else if (dto.employeeAge < 18) {
      ageCategory = WageAgeCategory.AGE_16_17;
    } else if (dto.employeeAge < 21) {
      ageCategory = WageAgeCategory.AGE_18_20;
    } else {
      ageCategory = WageAgeCategory.AGE_21_PLUS;
    }

    const applicableMinimumWage = minimumWageRates[ageCategory];
    const actualHourlyRate = dto.grossPay / dto.totalHoursWorked;
    
    const relevantPay = dto.grossPay - (dto.allowableDeductions || 0);
    const effectiveHourlyRate = relevantPay / dto.totalHoursWorked;

    const status = effectiveHourlyRate < applicableMinimumWage ? MinimumWageStatus.UNDERPAYMENT : MinimumWageStatus.COMPLIANT;
    const underpaymentAmount = status === MinimumWageStatus.UNDERPAYMENT 
      ? (applicableMinimumWage - effectiveHourlyRate) * dto.totalHoursWorked 
      : undefined;

    const compliance = this.minimumWageRepo.create({
      organizationId: dto.organizationId,
      employeeId: dto.employeeId,
      payPeriodStart: dto.payPeriodStart,
      payPeriodEnd: dto.payPeriodEnd,
      employeeAge: dto.employeeAge,
      ageCategory,
      applicableMinimumWage,
      actualHourlyRate,
      totalHoursWorked: dto.totalHoursWorked,
      grossPay: dto.grossPay,
      allowableDeductions: dto.allowableDeductions,
      relevantPay,
      status,
      underpaymentAmount,
      isApprentice: dto.isApprentice || false,
    });

    return this.minimumWageRepo.save(compliance);
  }

  async findMinimumWageCompliance(orgId: string, employeeId?: string): Promise<MinimumWageCompliance[]> {
    const where: any = { organizationId: orgId };
    if (employeeId) where.employeeId = employeeId;
    return this.minimumWageRepo.find({ where, order: { payPeriodStart: 'DESC' } });
  }

  async getMinimumWageViolations(orgId: string): Promise<MinimumWageCompliance[]> {
    return this.minimumWageRepo.find({
      where: { organizationId: orgId, status: MinimumWageStatus.UNDERPAYMENT },
      order: { payPeriodStart: 'DESC' },
    });
  }

  // ========== FAMILY LEAVE ==========
  async createFamilyLeave(dto: CreateFamilyLeaveDto): Promise<FamilyLeave> {
    const leaveNumber = `FL-${Date.now()}`;
    
    const familyLeave = this.familyLeaveRepo.create({
      ...dto,
      leaveNumber,
      requestDate: new Date(),
    });

    return this.familyLeaveRepo.save(familyLeave);
  }

  async updateFamilyLeave(id: string, dto: UpdateFamilyLeaveDto): Promise<FamilyLeave> {
    const familyLeave = await this.familyLeaveRepo.findOne({ where: { id } });
    if (!familyLeave) throw new NotFoundException('Family leave not found');

    Object.assign(familyLeave, dto);
    return this.familyLeaveRepo.save(familyLeave);
  }

  async findAllFamilyLeave(orgId: string, employeeId?: string): Promise<FamilyLeave[]> {
    const where: any = { organizationId: orgId };
    if (employeeId) where.employeeId = employeeId;
    return this.familyLeaveRepo.find({ where, order: { requestDate: 'DESC' } });
  }

  // ========== GDPR COMPLIANCE ==========
  async createGDPRDataRequest(dto: CreateGDPRDataRequestDto): Promise<GDPRDataRequest> {
    const requestNumber = `GDPR-${Date.now()}`;
    const requestDate = new Date();
    const dueDate = new Date(requestDate);
    dueDate.setDate(dueDate.getDate() + 30); // 30 days to respond

    const request = this.gdprRequestRepo.create({
      ...dto,
      requestNumber,
      requestDate,
      dueDate,
    });

    return this.gdprRequestRepo.save(request);
  }

  async updateGDPRDataRequest(id: string, status: string, responseDetails?: string, completedBy?: string): Promise<GDPRDataRequest> {
    const request = await this.gdprRequestRepo.findOne({ where: { id } });
    if (!request) throw new NotFoundException('GDPR request not found');

    request.status = status as any;
    if (responseDetails) request.responseDetails = responseDetails;
    if (status === 'COMPLETED') {
      request.completedDate = new Date();
      if (completedBy) request.assignedTo = completedBy;
    }

    return this.gdprRequestRepo.save(request);
  }

  async findAllGDPRDataRequests(orgId: string): Promise<GDPRDataRequest[]> {
    return this.gdprRequestRepo.find({
      where: { organizationId: orgId },
      order: { requestDate: 'DESC' },
    });
  }

  async createGDPRDataBreach(dto: CreateGDPRDataBreachDto): Promise<GDPRDataBreach> {
    const breachNumber = `BREACH-${Date.now()}`;
    
    const breach = this.gdprBreachRepo.create({
      ...dto,
      breachNumber,
      timeline: [{
        date: new Date(),
        event: 'Breach Discovered',
        description: dto.description,
      }],
    });

    // Auto-report to ICO if high severity
    if (dto.severity === 'HIGH' || dto.severity === 'CRITICAL') {
      breach.reportedToICO = true;
      breach.icoReportDate = new Date();
    }

    return this.gdprBreachRepo.save(breach);
  }

  async findAllGDPRDataBreaches(orgId: string): Promise<GDPRDataBreach[]> {
    return this.gdprBreachRepo.find({
      where: { organizationId: orgId },
      order: { breachDate: 'DESC' },
    });
  }

  // ========== AGENCY WORKERS ==========
  async createAgencyWorker(dto: CreateAgencyWorkerDto): Promise<AgencyWorker> {
    const worker = this.agencyWorkerRepo.create(dto);
    return this.agencyWorkerRepo.save(worker);
  }

  async updateAgencyWorker(id: string, dto: UpdateAgencyWorkerDto): Promise<AgencyWorker> {
    const worker = await this.agencyWorkerRepo.findOne({ where: { id } });
    if (!worker) throw new NotFoundException('Agency worker not found');

    Object.assign(worker, dto);

    // Check if eligible for equal treatment (12 weeks)
    if (worker.weeksWorked >= 12 && !worker.equalTreatmentEligibleDate) {
      const eligibleDate = new Date(worker.assignmentStartDate);
      eligibleDate.setDate(eligibleDate.getDate() + (12 * 7));
      worker.equalTreatmentEligibleDate = eligibleDate;
      worker.status = AgencyWorkerStatus.EQUAL_TREATMENT_ELIGIBLE;
    }

    return this.agencyWorkerRepo.save(worker);
  }

  async findAllAgencyWorkers(orgId: string): Promise<AgencyWorker[]> {
    return this.agencyWorkerRepo.find({
      where: { organizationId: orgId },
      order: { assignmentStartDate: 'DESC' },
    });
  }

  async checkAgencyWorkerCompliance(orgId: string): Promise<any[]> {
    const workers = await this.agencyWorkerRepo.find({
      where: { organizationId: orgId, status: AgencyWorkerStatus.EQUAL_TREATMENT_ELIGIBLE },
    });

    return workers.filter(w => !w.equalTreatmentApplied || !w.payParityAchieved);
  }

  // ========== ANALYTICS & REPORTS ==========
  async getEmploymentLawDashboard(orgId: string): Promise<any> {
    const [
      equalityCases,
      workingTimeViolations,
      redundancyProcesses,
      whistleblowingCases,
      minimumWageViolations,
      gdprRequests,
      agencyWorkerIssues,
    ] = await Promise.all([
      this.equalityCaseRepo.count({ where: { organizationId: orgId } }),
      this.workingTimeRepo.count({ where: { organizationId: orgId, complianceStatus: ComplianceStatus.VIOLATION } }),
      this.redundancyRepo.count({ where: { organizationId: orgId } }),
      this.whistleblowingRepo.count({ where: { organizationId: orgId } }),
      this.minimumWageRepo.count({ where: { organizationId: orgId, status: MinimumWageStatus.UNDERPAYMENT } }),
      this.gdprRequestRepo.count({ where: { organizationId: orgId } }),
      this.checkAgencyWorkerCompliance(orgId),
    ]);

    return {
      equalityCases,
      workingTimeViolations,
      redundancyProcesses,
      whistleblowingCases,
      minimumWageViolations,
      gdprRequests,
      agencyWorkerComplianceIssues: agencyWorkerIssues.length,
      overallComplianceScore: this.calculateComplianceScore({
        workingTimeViolations,
        minimumWageViolations,
        agencyWorkerIssues: agencyWorkerIssues.length,
      }),
    };
  }

  private calculateComplianceScore(metrics: any): number {
    const totalIssues = metrics.workingTimeViolations + metrics.minimumWageViolations + metrics.agencyWorkerIssues;
    if (totalIssues === 0) return 100;
    if (totalIssues <= 5) return 85;
    if (totalIssues <= 10) return 70;
    if (totalIssues <= 20) return 50;
    return 30;
  }
}
