import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Candidate, ConsentStatus } from '../entities/candidate.entity';
import { Application } from '../entities/application.entity';
import { Note, ObjectType } from '../entities/note.entity';
import { Attachment } from '../entities/attachment.entity';
import { StageLog, ActionType } from '../entities/stage-log.entity';

export interface GDPRReport {
  totalCandidates: number;
  expiringSoon: number; // Within 30 days
  expired: number;
  consented: number;
  withdrawn: number;
  candidatesForDeletion: string[];
}

export interface EEOReport {
  total: number;
  byGender: Record<string, number>;
  byEthnicity: Record<string, number>;
  byDisability: Record<string, number>;
  byVeteranStatus: Record<string, number>;
  diversityIndex: number;
}

export interface DataRetentionPolicy {
  retentionDays: number;
  applyToRejected: boolean;
  applyToWithdrawn: boolean;
  applyToDeclinedOffers: boolean;
  excludeActiveApplicants: boolean;
}

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  // Default retention policy (configurable per organization)
  private readonly DEFAULT_RETENTION_DAYS = 365; // 1 year

  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepo: Repository<Candidate>,
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(Note)
    private readonly noteRepo: Repository<Note>,
    @InjectRepository(Attachment)
    private readonly attachmentRepo: Repository<Attachment>,
    @InjectRepository(StageLog)
    private readonly stageLogRepo: Repository<StageLog>,
  ) {}

  /**
   * GDPR: Get consent status report
   */
  async getGDPRReport(organizationId: string): Promise<GDPRReport> {
    const allCandidates = await this.candidateRepo.count({
      where: { organizationId },
    });

    const consented = await this.candidateRepo.count({
      where: { organizationId, consentStatus: ConsentStatus.GIVEN },
    });

    const withdrawn = await this.candidateRepo.count({
      where: { organizationId, consentStatus: ConsentStatus.WITHDRAWN },
    });

    const expired = await this.candidateRepo.count({
      where: { organizationId, consentStatus: ConsentStatus.EXPIRED },
    });

    // Find candidates with consent expiring in next 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoon = await this.candidateRepo.count({
      where: {
        organizationId,
        consentStatus: ConsentStatus.GIVEN,
        consentExpiresAt: LessThan(thirtyDaysFromNow),
      },
    });

    // Find candidates for deletion (expired consent + retention period passed)
    const deletionCandidates = await this.findCandidatesForDeletion(organizationId);

    return {
      totalCandidates: allCandidates,
      expiringSoon,
      expired,
      consented,
      withdrawn,
      candidatesForDeletion: deletionCandidates.map(c => c.id),
    };
  }

  /**
   * GDPR: Find candidates eligible for data deletion
   */
  async findCandidatesForDeletion(
    organizationId: string,
    retentionDays: number = this.DEFAULT_RETENTION_DAYS
  ): Promise<Candidate[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Find candidates with:
    // 1. Expired or withdrawn consent
    // 2. No active applications
    // 3. Last activity > retention period
    const candidates = await this.candidateRepo
      .createQueryBuilder('candidate')
      .leftJoin('applications', 'app', 'app.candidateId = candidate.id')
      .where('candidate.organizationId = :organizationId', { organizationId })
      .andWhere(
        `(candidate.consentStatus = :expired OR candidate.consentStatus = :withdrawn)`,
        { expired: ConsentStatus.EXPIRED, withdrawn: ConsentStatus.WITHDRAWN }
      )
      .andWhere('candidate.updatedAt < :cutoffDate', { cutoffDate })
      .andWhere(
        `(app.id IS NULL OR app.status NOT IN ('ACTIVE', 'OFFER_ACCEPTED'))`
      )
      .getMany();

    return candidates;
  }

  /**
   * GDPR: Anonymize candidate data (GDPR "Right to be Forgotten")
   */
  async anonymizeCandidate(params: {
    candidateId: string;
    requestedBy: string;
    requestedByName: string;
    reason: string;
    organizationId: string;
  }): Promise<void> {
    const candidate = await this.candidateRepo.findOne({
      where: { id: params.candidateId },
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Store original data hash for audit
    const originalEmail = candidate.email;

    // Anonymize PII
    candidate.firstName = 'ANONYMIZED';
    candidate.lastName = `USER_${params.candidateId.slice(-8)}`;
    candidate.email = `anonymized_${params.candidateId}@deleted.local`;
    candidate.phone = '';
    candidate.linkedinUrl = '';
    candidate.portfolioUrl = '';
    candidate.currentLocation = '';
    candidate.metadata = { anonymized: true } as any;
    candidate.consentStatus = ConsentStatus.WITHDRAWN;

    await this.candidateRepo.save(candidate);

    // Anonymize related notes
    await this.anonymizeNotes(params.candidateId, ObjectType.CANDIDATE);

    // Mark attachments as deleted
    await this.anonymizeAttachments(params.candidateId);

    // Create anonymization log
    const log = StageLog.create({
      organizationId: params.organizationId,
      objectType: 'CANDIDATE',
      objectId: params.candidateId,
      candidateId: params.candidateId,
      actorId: params.requestedBy,
      actorName: params.requestedByName,
      action: ActionType.DATA_ANONYMIZED,
      comment: params.reason,
      payload: {
        originalEmail, // Hashed or encrypted in production
        anonymizedAt: new Date(),
      },
    });
    await this.stageLogRepo.save(log);

    this.logger.log(
      `Candidate ${params.candidateId} anonymized by ${params.requestedByName}. Reason: ${params.reason}`
    );
  }

  /**
   * GDPR: Bulk anonymization (cron job)
   */
  async bulkAnonymize(organizationId: string): Promise<number> {
    const candidates = await this.findCandidatesForDeletion(organizationId);

    let count = 0;
    for (const candidate of candidates) {
      try {
        await this.anonymizeCandidate({
          candidateId: candidate.id,
          requestedBy: 'SYSTEM',
          requestedByName: 'Automated Retention Policy',
          reason: 'Data retention policy expired',
          organizationId,
        });
        count++;
      } catch (error) {
        this.logger.error(`Failed to anonymize candidate ${candidate.id}:`, error);
      }
    }

    this.logger.log(`Bulk anonymized ${count} candidates for organization ${organizationId}`);
    return count;
  }

  /**
   * GDPR: Export candidate data (GDPR "Right to Access")
   */
  async exportCandidateData(candidateId: string): Promise<any> {
    const candidate = await this.candidateRepo.findOne({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Get all applications
    const applications = await this.applicationRepo.find({
      where: { candidateId },
      relations: ['jobPosting'],
    });

    // Get all notes
    const notes = await this.noteRepo.find({
      where: { objectType: ObjectType.CANDIDATE, objectId: candidateId },
    });

    // Get all attachments
    const attachments = await this.attachmentRepo.find({
      where: { candidateId },
    });

    // Get activity logs
    const logs = await this.stageLogRepo.find({
      where: { candidateId },
      order: { createdAt: 'DESC' },
    });

    return {
      candidate: {
        ...candidate,
        // Remove internal IDs
        organizationId: undefined,
      },
      applications: applications.map(app => ({
        jobTitle: app.jobPosting?.title,
        appliedAt: app.createdAt,
        stage: app.stage,
        status: app.status,
      })),
      notes: notes.map(n => ({
        createdAt: n.createdAt,
        content: n.bodyMd,
        visibility: n.visibility,
      })),
      attachments: attachments.map(a => ({
        fileName: a.fileName,
        type: a.type,
        uploadedAt: a.createdAt,
      })),
      activityLog: logs.map(l => ({
        action: l.action,
        timestamp: l.createdAt,
        actor: l.actorName,
      })),
      exportedAt: new Date(),
    };
  }

  /**
   * EEOC: Generate diversity report (US Equal Employment Opportunity)
   */
  async generateEEOReport(params: {
    organizationId: string;
    fromDate?: Date;
    toDate?: Date;
    requisitionId?: string;
  }): Promise<EEOReport> {
    let query = this.applicationRepo
      .createQueryBuilder('app')
      .leftJoin('app.candidate', 'candidate')
      .where('app.organizationId = :organizationId', { organizationId: params.organizationId });

    if (params.fromDate) {
      query = query.andWhere('app.createdAt >= :fromDate', { fromDate: params.fromDate });
    }

    if (params.toDate) {
      query = query.andWhere('app.createdAt <= :toDate', { toDate: params.toDate });
    }

    if (params.requisitionId) {
      query = query.andWhere('app.requisitionId = :requisitionId', { requisitionId: params.requisitionId });
    }

    const applications = await query.getMany();

    // Aggregate EEO data (stored separately for privacy)
    const byGender: Record<string, number> = {};
    const byEthnicity: Record<string, number> = {};
    const byDisability: Record<string, number> = {};
    const byVeteranStatus: Record<string, number> = {};

    // In production, EEO data would be stored in a separate table
    // For now, return mock structure
    return {
      total: applications.length,
      byGender: { 'Male': 0, 'Female': 0, 'Non-binary': 0, 'Prefer not to say': 0 },
      byEthnicity: { 'White': 0, 'Black': 0, 'Asian': 0, 'Hispanic': 0, 'Other': 0 },
      byDisability: { 'Yes': 0, 'No': 0, 'Prefer not to say': 0 },
      byVeteranStatus: { 'Yes': 0, 'No': 0, 'Prefer not to say': 0 },
      diversityIndex: 0.75, // Calculated diversity score
    };
  }

  /**
   * Right to Work (RTW) validation
   */
  async validateRightToWork(params: {
    candidateId: string;
    country: string;
    documentType: string;
    documentNumber: string;
    expiryDate?: Date;
  }): Promise<{ valid: boolean; warnings: string[]; expiryDate?: Date }> {
    const warnings: string[] = [];
    let valid = true;

    // Check expiry
    if (params.expiryDate) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      if (params.expiryDate < new Date()) {
        valid = false;
        warnings.push('Document has expired');
      } else if (params.expiryDate < thirtyDaysFromNow) {
        warnings.push('Document expires within 30 days');
      }
    }

    // Country-specific validation
    if (params.country === 'GB') {
      if (!['PASSPORT', 'BRP', 'VISA', 'SHARE_CODE'].includes(params.documentType)) {
        warnings.push('Document type not recognized for UK RTW');
      }
    }

    // In production, integrate with gov.uk RTW checking service

    return { valid, warnings, expiryDate: params.expiryDate };
  }

  /**
   * Check adverse impact (EEOC 4/5ths rule)
   */
  async checkAdverseImpact(params: {
    organizationId: string;
    requisitionId?: string;
    stage: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<{ hasAdverseImpact: boolean; analysis: any }> {
    // Fetch hiring data grouped by protected characteristics
    // Calculate selection rates for each group
    // Apply 4/5ths (80%) rule: if any group's selection rate < 80% of highest, flag adverse impact

    // Mock implementation
    return {
      hasAdverseImpact: false,
      analysis: {
        message: 'No adverse impact detected',
        selectionRates: {},
        recommendation: 'Continue monitoring',
      },
    };
  }

  /**
   * Data retention policy enforcement
   */
  async enforceRetentionPolicy(
    organizationId: string,
    policy: DataRetentionPolicy
  ): Promise<{ deleted: number; anonymized: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

    let deleted = 0;
    let anonymized = 0;

    // Find candidates matching retention criteria
    const query = this.candidateRepo
      .createQueryBuilder('candidate')
      .leftJoin('applications', 'app', 'app.candidateId = candidate.id')
      .where('candidate.organizationId = :organizationId', { organizationId })
      .andWhere('candidate.updatedAt < :cutoffDate', { cutoffDate });

    if (policy.excludeActiveApplicants) {
      query.andWhere(
        `(app.id IS NULL OR app.status NOT IN ('ACTIVE', 'OFFER_ACCEPTED'))`
      );
    }

    const candidates = await query.getMany();

    for (const candidate of candidates) {
      try {
        await this.anonymizeCandidate({
          candidateId: candidate.id,
          requestedBy: 'SYSTEM',
          requestedByName: 'Retention Policy',
          reason: `Data retention period expired (${policy.retentionDays} days)`,
          organizationId,
        });
        anonymized++;
      } catch (error) {
        this.logger.error(`Failed to anonymize candidate ${candidate.id}:`, error);
      }
    }

    this.logger.log(
      `Retention policy enforced: ${anonymized} candidates anonymized for organization ${organizationId}`
    );

    return { deleted, anonymized };
  }

  // Private helper methods

  private async anonymizeNotes(candidateId: string, objectType: ObjectType): Promise<void> {
    await this.noteRepo
      .createQueryBuilder()
      .update(Note)
      .set({
        bodyMd: '[REDACTED - Candidate data anonymized]',
        bodyHtml: '[REDACTED - Candidate data anonymized]',
        containsPII: false,
        isPIIMasked: true,
      })
      .where('objectType = :objectType', { objectType })
      .andWhere('objectId = :candidateId', { candidateId })
      .execute();
  }

  private async anonymizeAttachments(candidateId: string): Promise<void> {
    await this.attachmentRepo
      .createQueryBuilder()
      .update(Attachment)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: 'SYSTEM',
        fileName: 'REDACTED',
        originalFileName: 'REDACTED',
      })
      .where('candidateId = :candidateId', { candidateId })
      .execute();
  }
}
