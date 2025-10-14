import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ERInvestigation, InvestigationStatus, ERInvestigationNote } from '../entities/er-investigation.entity';
import {
  CreateERInvestigationDto,
  UpdateERInvestigationDto,
  AddInvestigationNoteDto,
  RecordInterviewDto,
  ConcludeInvestigationDto,
} from '../dto/hrsd.dto';

@Injectable()
export class ERInvestigationService {
  constructor(
    @InjectRepository(ERInvestigation)
    private readonly investigationRepository: Repository<ERInvestigation>,
    @InjectRepository(ERInvestigationNote)
    private readonly noteRepository: Repository<ERInvestigationNote>,
  ) {}

  async createInvestigation(dto: CreateERInvestigationDto): Promise<ERInvestigation> {
    // Generate case number
    const count = await this.investigationRepository.count({ where: { organizationId: dto.organizationId } });
    const caseNumber = `ER-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    const investigation = this.investigationRepository.create({
      ...dto,
      caseNumber,
      status: InvestigationStatus.REPORTED,
      reportedDate: new Date(),
      confidential: true, // Always confidential
    });

    const saved = await this.investigationRepository.save(investigation);

    // Log initial access
    await this.logAccess(saved.id, dto.leadInvestigatorId, 'CREATED');

    return saved;
  }

  async updateInvestigation(id: string, dto: UpdateERInvestigationDto, userId: string): Promise<ERInvestigation> {
    const investigation = await this.checkAccess(id, userId);

    Object.assign(investigation, dto);

    if (dto.status === InvestigationStatus.INVESTIGATION_STARTED && !investigation.investigationStartDate) {
      investigation.investigationStartDate = new Date();
    }

    await this.logAccess(id, userId, 'EDITED');

    return this.investigationRepository.save(investigation);
  }

  async startInvestigation(id: string, userId: string, targetCompletionDate: Date): Promise<ERInvestigation> {
    const investigation = await this.checkAccess(id, userId);

    investigation.status = InvestigationStatus.INVESTIGATION_STARTED;
    investigation.investigationStartDate = new Date();
    investigation.targetCompletionDate = targetCompletionDate;

    await this.logAccess(id, userId, 'STARTED');

    return this.investigationRepository.save(investigation);
  }

  async addNote(dto: AddInvestigationNoteDto, userId: string): Promise<ERInvestigationNote> {
    await this.checkAccess(dto.investigationId, userId);

    const note = this.noteRepository.create({
      ...dto,
      createdTimestamp: new Date(),
    });

    await this.logAccess(dto.investigationId, userId, 'ADDED_NOTE');

    return this.noteRepository.save(note);
  }

  async addEvidence(
    investigationId: string,
    evidence: {
      type: string;
      description: string;
      uploadedBy: string;
      secureUrl: string;
      checksumMD5?: string;
    },
    userId: string,
  ): Promise<ERInvestigation> {
    const investigation = await this.checkAccess(investigationId, userId);

    const evidenceEntry = {
      id: `EV-${Date.now()}`,
      ...evidence,
      uploadedAt: new Date().toISOString(),
    };

    if (!investigation.evidenceLog) {
      investigation.evidenceLog = [];
    }

    investigation.evidenceLog.push(evidenceEntry);

    if (!investigation.evidenceFiles) {
      investigation.evidenceFiles = [];
    }
    investigation.evidenceFiles.push(evidence.secureUrl);

    await this.logAccess(investigationId, userId, 'ADDED_EVIDENCE');

    return this.investigationRepository.save(investigation);
  }

  async recordInterview(dto: RecordInterviewDto, userId: string): Promise<ERInvestigation> {
    const investigation = await this.checkAccess(dto.investigationId, userId);

    const interview = {
      id: `INT-${Date.now()}`,
      ...dto,
      completedDate: dto.scheduledDate ? undefined : new Date().toISOString(),
    };

    if (!investigation.interviews) {
      investigation.interviews = [];
    }

    investigation.interviews.push(interview);

    if (investigation.status === InvestigationStatus.EVIDENCE_GATHERING) {
      investigation.status = InvestigationStatus.INTERVIEWS_SCHEDULED;
    }

    await this.logAccess(dto.investigationId, userId, 'RECORDED_INTERVIEW');

    return this.investigationRepository.save(investigation);
  }

  async concludeInvestigation(dto: ConcludeInvestigationDto, userId: string): Promise<ERInvestigation> {
    const investigation = await this.checkAccess(dto.investigationId, userId);

    investigation.status = InvestigationStatus.CONCLUDED;
    investigation.outcome = dto.outcome;
    investigation.findings = dto.findings;
    investigation.recommendations = dto.recommendations;
    investigation.actionsTaken = dto.actionsTaken;
    investigation.disciplinaryActions = dto.disciplinaryActions;
    investigation.concludedDate = new Date();

    await this.logAccess(dto.investigationId, userId, 'CONCLUDED');

    return this.investigationRepository.save(investigation);
  }

  async notifyParties(
    investigationId: string,
    party: 'COMPLAINANT' | 'RESPONDENT',
    userId: string,
  ): Promise<ERInvestigation> {
    const investigation = await this.checkAccess(investigationId, userId);

    if (party === 'COMPLAINANT') {
      investigation.complainantNotified = true;
      investigation.complainantNotifiedAt = new Date();
    } else {
      investigation.respondentNotified = true;
      investigation.respondentNotifiedAt = new Date();
    }

    if (investigation.status === InvestigationStatus.CONCLUDED) {
      investigation.status = InvestigationStatus.OUTCOME_COMMUNICATED;
    }

    await this.logAccess(investigationId, userId, `NOTIFIED_${party}`);

    return this.investigationRepository.save(investigation);
  }

  async closeInvestigation(investigationId: string, userId: string): Promise<ERInvestigation> {
    const investigation = await this.checkAccess(investigationId, userId);

    if (investigation.status !== InvestigationStatus.OUTCOME_COMMUNICATED) {
      throw new ForbiddenException('Investigation must have outcome communicated before closing');
    }

    investigation.status = InvestigationStatus.CLOSED;
    investigation.closedDate = new Date();

    await this.logAccess(investigationId, userId, 'CLOSED');

    return this.investigationRepository.save(investigation);
  }

  async requestLegalReview(investigationId: string, userId: string): Promise<ERInvestigation> {
    const investigation = await this.checkAccess(investigationId, userId);

    investigation.legalReviewRequired = true;

    await this.logAccess(investigationId, userId, 'REQUESTED_LEGAL_REVIEW');

    return this.investigationRepository.save(investigation);
  }

  async completeLegalReview(
    investigationId: string,
    reviewedBy: string,
    userId: string,
  ): Promise<ERInvestigation> {
    const investigation = await this.checkAccess(investigationId, userId);

    investigation.legalReviewCompleted = true;
    investigation.legalReviewedBy = reviewedBy;
    investigation.legalReviewDate = new Date();

    await this.logAccess(investigationId, userId, 'COMPLETED_LEGAL_REVIEW');

    return this.investigationRepository.save(investigation);
  }

  async getInvestigation(id: string, userId: string): Promise<ERInvestigation> {
    const investigation = await this.checkAccess(id, userId);
    await this.logAccess(id, userId, 'VIEWED');
    return investigation;
  }

  async getInvestigationsByOrg(organizationId: string, userId: string): Promise<ERInvestigation[]> {
    // Get investigations where user is authorized
    const investigations = await this.investigationRepository
      .createQueryBuilder('inv')
      .where('inv.organizationId = :organizationId', { organizationId })
      .andWhere(
        '(inv.leadInvestigatorId = :userId OR :userId = ANY(inv.investigationTeam) OR :userId = ANY(inv.authorizedViewers))',
        { userId },
      )
      .orderBy('inv.reportedDate', 'DESC')
      .getMany();

    return investigations;
  }

  async getInvestigationNotes(investigationId: string, userId: string): Promise<ERInvestigationNote[]> {
    await this.checkAccess(investigationId, userId);

    return this.noteRepository.find({
      where: { investigationId },
      order: { createdTimestamp: 'DESC' },
    });
  }

  async getInvestigationMetrics(organizationId: string): Promise<any> {
    const investigations = await this.investigationRepository.find({
      where: { organizationId },
    });

    const total = investigations.length;
    const open = investigations.filter(i => i.status !== InvestigationStatus.CLOSED).length;
    const concluded = investigations.filter(i => i.status === InvestigationStatus.CONCLUDED || i.status === InvestigationStatus.CLOSED).length;

    const byType = investigations.reduce((acc, inv) => {
      acc[inv.investigationType] = (acc[inv.investigationType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = investigations.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgDuration = concluded > 0
      ? investigations
          .filter(i => i.concludedDate && i.reportedDate)
          .reduce((sum, i) => {
            const days = Math.floor(
              (new Date(i.concludedDate!).getTime() - new Date(i.reportedDate).getTime()) / (1000 * 60 * 60 * 24),
            );
            return sum + days;
          }, 0) / concluded
      : 0;

    return {
      total,
      open,
      concluded,
      byType,
      byStatus,
      avgDurationDays: avgDuration,
    };
  }

  // ============ Access Control ============

  private async checkAccess(investigationId: string, userId: string): Promise<ERInvestigation> {
    const investigation = await this.investigationRepository.findOne({ where: { id: investigationId } });

    if (!investigation) {
      throw new NotFoundException('Investigation not found');
    }

    // Check if user has access
    const hasAccess =
      investigation.leadInvestigatorId === userId ||
      investigation.investigationTeam?.includes(userId) ||
      investigation.authorizedViewers?.includes(userId);

    if (!hasAccess) {
      throw new ForbiddenException('Access denied to this investigation');
    }

    return investigation;
  }

  private async logAccess(investigationId: string, userId: string, action: string): Promise<void> {
    const investigation = await this.investigationRepository.findOne({ where: { id: investigationId } });
    if (!investigation) return;

    const accessEntry = {
      userId,
      userName: 'User', // In real app, fetch from user service
      accessedAt: new Date().toISOString(),
      action,
      ipAddress: 'N/A', // Would come from request
    };

    if (!investigation.accessLog) {
      investigation.accessLog = [];
    }

    investigation.accessLog.push(accessEntry);

    await this.investigationRepository.save(investigation);
  }
}
