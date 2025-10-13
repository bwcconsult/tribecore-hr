import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { RiskAssessment, RiskStatus, RiskLevel } from './entities/risk-assessment.entity';
import { Incident, IncidentStatus } from './entities/incident.entity';
import { HazardousSubstance } from './entities/hazardous-substance.entity';
import { MethodStatement } from './entities/method-statement.entity';
import { HSResponsibility } from './entities/hs-responsibility.entity';
import { HSAuditLog, AuditAction, AuditModule } from './entities/hs-audit.entity';
import { CreateRiskAssessmentDto, CreateIncidentDto } from './dto/create-risk-assessment.dto';

@Injectable()
export class HealthSafetyService {
  constructor(
    @InjectRepository(RiskAssessment)
    private riskRepo: Repository<RiskAssessment>,
    @InjectRepository(Incident)
    private incidentRepo: Repository<Incident>,
    @InjectRepository(HazardousSubstance)
    private substanceRepo: Repository<HazardousSubstance>,
    @InjectRepository(MethodStatement)
    private methodRepo: Repository<MethodStatement>,
    @InjectRepository(HSResponsibility)
    private responsibilityRepo: Repository<HSResponsibility>,
    @InjectRepository(HSAuditLog)
    private auditRepo: Repository<HSAuditLog>,
  ) {}

  // === RISK ASSESSMENTS ===
  async createRiskAssessment(dto: CreateRiskAssessmentDto, userId: string): Promise<RiskAssessment> {
    const refNumber = `RA-${Date.now()}`;
    
    const processedHazards = dto.hazards.map((h, idx) => ({
      id: `${idx + 1}`,
      ...h,
      riskRating: h.likelihood * h.severity,
      riskLevel: this.calculateRiskLevel(h.likelihood * h.severity),
      residualLikelihood: h.likelihood,
      residualSeverity: h.severity,
      residualRisk: h.likelihood * h.severity,
      residualRiskLevel: this.calculateRiskLevel(h.likelihood * h.severity),
      actionCompleted: false,
    }));

    const assessment = this.riskRepo.create({
      ...dto,
      referenceNumber: refNumber,
      hazards: processedHazards,
      status: RiskStatus.DRAFT,
    });

    const saved = await this.riskRepo.save(assessment);
    await this.createAuditLog(AuditModule.RISK_ASSESSMENT, AuditAction.CREATED, saved.id, userId, dto.organizationId);
    return saved;
  }

  async findAllRiskAssessments(orgId: string): Promise<RiskAssessment[]> {
    return this.riskRepo.find({ where: { organizationId: orgId }, order: { createdAt: 'DESC' } });
  }

  async approveRiskAssessment(id: string, approvedBy: string): Promise<RiskAssessment> {
    const assessment = await this.riskRepo.findOne({ where: { id } });
    if (!assessment) throw new NotFoundException('Risk assessment not found');
    
    assessment.status = RiskStatus.APPROVED;
    assessment.approvedBy = approvedBy;
    return this.riskRepo.save(assessment);
  }

  // === INCIDENTS ===
  async createIncident(dto: CreateIncidentDto, userId: string): Promise<Incident> {
    const incidentNumber = `INC-${Date.now()}`;
    
    const incident = this.incidentRepo.create({
      ...dto,
      incidentNumber,
      status: IncidentStatus.REPORTED,
    });

    const saved = await this.incidentRepo.save(incident);
    await this.createAuditLog(AuditModule.INCIDENT, AuditAction.CREATED, saved.id, userId, dto.organizationId);
    return saved;
  }

  async findAllIncidents(orgId: string, filters?: any): Promise<Incident[]> {
    const query: any = { organizationId: orgId };
    if (filters?.type) query.type = filters.type;
    if (filters?.status) query.status = filters.status;
    
    return this.incidentRepo.find({ where: query, order: { incidentDateTime: 'DESC' } });
  }

  async updateIncidentStatus(id: string, status: IncidentStatus, userId: string): Promise<Incident> {
    const incident = await this.incidentRepo.findOne({ where: { id } });
    if (!incident) throw new NotFoundException('Incident not found');
    
    incident.status = status;
    return this.incidentRepo.save(incident);
  }

  // === HAZARDOUS SUBSTANCES ===
  async createSubstance(data: Partial<HazardousSubstance>): Promise<HazardousSubstance> {
    const code = `COSHH-${Date.now()}`;
    const substance = this.substanceRepo.create({ ...data, substanceCode: code });
    return this.substanceRepo.save(substance);
  }

  async findAllSubstances(orgId: string): Promise<HazardousSubstance[]> {
    return this.substanceRepo.find({ where: { organizationId: orgId, isActive: true } });
  }

  // === METHOD STATEMENTS ===
  async createMethodStatement(data: Partial<MethodStatement>): Promise<MethodStatement> {
    const refNumber = `MS-${Date.now()}`;
    const statement = this.methodRepo.create({ ...data, referenceNumber: refNumber, version: 1 });
    return this.methodRepo.save(statement);
  }

  async findAllMethodStatements(orgId: string): Promise<MethodStatement[]> {
    return this.methodRepo.find({ where: { organizationId: orgId }, order: { issueDate: 'DESC' } });
  }

  // === RESPONSIBILITIES ===
  async assignResponsibility(data: Partial<HSResponsibility>): Promise<HSResponsibility> {
    const responsibility = this.responsibilityRepo.create(data);
    return this.responsibilityRepo.save(responsibility);
  }

  async findResponsibilities(userId: string): Promise<HSResponsibility[]> {
    return this.responsibilityRepo.find({ where: { assignedTo: userId }, order: { dueDate: 'ASC' } });
  }

  // === ANALYTICS ===
  async getAnalytics(orgId: string, startDate: Date, endDate: Date) {
    const risks = await this.riskRepo.count({ where: { organizationId: orgId } });
    const incidents = await this.incidentRepo.count({ 
      where: { organizationId: orgId, incidentDateTime: Between(startDate, endDate) }
    });
    const nearMisses = await this.incidentRepo.count({ 
      where: { organizationId: orgId, type: 'NEAR_MISS' as any }
    });
    
    return { risks, incidents, nearMisses, complianceRate: 95 };
  }

  // === UTILITIES ===
  private calculateRiskLevel(rating: number): RiskLevel {
    if (rating <= 5) return RiskLevel.LOW;
    if (rating <= 12) return RiskLevel.MEDIUM;
    if (rating <= 20) return RiskLevel.HIGH;
    return RiskLevel.VERY_HIGH;
  }

  private async createAuditLog(module: AuditModule, action: AuditAction, entityId: string, userId: string, orgId: string) {
    const log = this.auditRepo.create({
      module,
      action,
      entityId,
      performedBy: userId,
      organizationId: orgId,
    });
    await this.auditRepo.save(log);
  }
}
