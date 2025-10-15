import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStage, ApplicationStatus } from '../entities/application.entity';
import { StageLog, ActionType } from '../entities/stage-log.entity';
import { Note, ObjectType, NoteVisibility } from '../entities/note.entity';

export interface StageTransition {
  from: ApplicationStage;
  to: ApplicationStage;
  allowedRoles: string[];
  requiresNote: boolean;
  requiresScorecard?: boolean;
  requiresApproval?: boolean;
  validations?: ((application: Application) => Promise<string | null>)[];
}

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  // State machine definition
  private readonly transitions: StageTransition[] = [
    // Forward transitions
    { from: ApplicationStage.NEW, to: ApplicationStage.SCREENING, allowedRoles: ['RECRUITER', 'SOURCER'], requiresNote: false },
    { from: ApplicationStage.SCREENING, to: ApplicationStage.HM_SCREEN, allowedRoles: ['RECRUITER'], requiresNote: false },
    { from: ApplicationStage.HM_SCREEN, to: ApplicationStage.ASSESSMENT, allowedRoles: ['RECRUITER', 'HIRING_MANAGER'], requiresNote: false },
    { from: ApplicationStage.HM_SCREEN, to: ApplicationStage.INTERVIEW, allowedRoles: ['RECRUITER', 'HIRING_MANAGER'], requiresNote: false },
    { from: ApplicationStage.ASSESSMENT, to: ApplicationStage.INTERVIEW, allowedRoles: ['RECRUITER', 'HIRING_MANAGER'], requiresNote: false },
    { from: ApplicationStage.INTERVIEW, to: ApplicationStage.PANEL, allowedRoles: ['RECRUITER', 'HIRING_MANAGER'], requiresNote: false, requiresScorecard: true },
    { from: ApplicationStage.PANEL, to: ApplicationStage.REFERENCE_CHECK, allowedRoles: ['RECRUITER', 'HIRING_MANAGER'], requiresNote: false, requiresScorecard: true },
    { from: ApplicationStage.REFERENCE_CHECK, to: ApplicationStage.OFFER, allowedRoles: ['RECRUITER', 'HIRING_MANAGER'], requiresNote: false },
    { from: ApplicationStage.OFFER, to: ApplicationStage.HIRED, allowedRoles: ['RECRUITER', 'HR'], requiresNote: false, requiresApproval: true },
    
    // Backward transitions (require note)
    { from: ApplicationStage.SCREENING, to: ApplicationStage.NEW, allowedRoles: ['RECRUITER'], requiresNote: true },
    { from: ApplicationStage.HM_SCREEN, to: ApplicationStage.SCREENING, allowedRoles: ['RECRUITER', 'HIRING_MANAGER'], requiresNote: true },
    { from: ApplicationStage.INTERVIEW, to: ApplicationStage.HM_SCREEN, allowedRoles: ['RECRUITER', 'HIRING_MANAGER'], requiresNote: true },
    { from: ApplicationStage.PANEL, to: ApplicationStage.INTERVIEW, allowedRoles: ['RECRUITER', 'HIRING_MANAGER'], requiresNote: true },
  ];

  constructor(
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(StageLog)
    private readonly stageLogRepo: Repository<StageLog>,
    @InjectRepository(Note)
    private readonly noteRepo: Repository<Note>,
  ) {}

  /**
   * Move application to next stage
   */
  async moveStage(params: {
    applicationId: string;
    toStage: ApplicationStage;
    actorId: string;
    actorName: string;
    actorRole: string;
    comment?: string;
    reasonCategory?: string;
    organizationId: string;
  }): Promise<Application> {
    const application = await this.applicationRepo.findOne({
      where: { id: params.applicationId },
      relations: ['candidate', 'jobPosting'],
    });

    if (!application) {
      throw new BadRequestException('Application not found');
    }

    const transition = this.findTransition(application.stage, params.toStage);
    if (!transition) {
      throw new BadRequestException(
        `Invalid stage transition from ${application.stage} to ${params.toStage}`
      );
    }

    // Check role permissions
    if (!transition.allowedRoles.includes(params.actorRole)) {
      throw new ForbiddenException(
        `Role ${params.actorRole} is not allowed to perform this transition`
      );
    }

    // Check if note is required
    const isBackward = this.isBackwardTransition(application.stage, params.toStage);
    if (transition.requiresNote || isBackward) {
      if (!params.comment || params.comment.trim().length === 0) {
        throw new BadRequestException(
          'A note is required for this stage transition'
        );
      }
      if (isBackward && !params.reasonCategory) {
        throw new BadRequestException(
          'A reason category is required when moving backward'
        );
      }
    }

    // Run validations
    if (transition.validations) {
      for (const validation of transition.validations) {
        const error = await validation(application);
        if (error) {
          throw new BadRequestException(error);
        }
      }
    }

    // Check scorecard requirement
    if (transition.requiresScorecard) {
      const hasScorecard = await this.hasRequiredScorecards(params.applicationId);
      if (!hasScorecard) {
        throw new BadRequestException(
          'All interview scorecards must be submitted before moving to this stage'
        );
      }
    }

    // Update application
    const previousStage = application.stage;
    application.stage = params.toStage;
    const saved = await this.applicationRepo.save(application);

    // Create stage log
    const log = StageLog.create({
      organizationId: params.organizationId,
      objectType: 'APPLICATION',
      objectId: params.applicationId,
      applicationId: params.applicationId,
      candidateId: application.candidateId,
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      action: ActionType.STAGE_CHANGED,
      fromValue: previousStage,
      toValue: params.toStage,
      comment: params.comment,
      reasonCategory: params.reasonCategory,
    });
    await this.stageLogRepo.save(log);

    // Create note if comment provided
    if (params.comment) {
      const note = new Note();
      note.objectType = ObjectType.APPLICATION;
      note.objectId = params.applicationId;
      note.organizationId = params.organizationId;
      note.authorId = params.actorId;
      note.authorName = params.actorName;
      note.authorRole = params.actorRole;
      note.visibility = NoteVisibility.PUBLIC;
      note.bodyMd = params.comment;
      note.reasonCategory = params.reasonCategory || undefined;
      note.isSystemGenerated = false;
      note.eventType = 'STAGE_CHANGED';
      note.tags = [previousStage, params.toStage];
      await this.noteRepo.save(note);
    }

    this.logger.log(
      `Application ${params.applicationId} moved from ${previousStage} to ${params.toStage} by ${params.actorName}`
    );

    return saved;
  }

  /**
   * Reject application
   */
  async reject(params: {
    applicationId: string;
    reason: string;
    feedback?: string;
    actorId: string;
    actorName: string;
    actorRole: string;
    organizationId: string;
  }): Promise<Application> {
    const application = await this.applicationRepo.findOne({
      where: { id: params.applicationId },
    });

    if (!application) {
      throw new BadRequestException('Application not found');
    }

    if (application.status === ApplicationStatus.REJECTED) {
      throw new BadRequestException('Application is already rejected');
    }

    application.reject(params.reason, params.feedback);
    const saved = await this.applicationRepo.save(application);

    // Create stage log
    const log = StageLog.create({
      organizationId: params.organizationId,
      objectType: 'APPLICATION',
      objectId: params.applicationId,
      applicationId: params.applicationId,
      candidateId: application.candidateId,
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      action: ActionType.APPLICATION_REJECTED,
      fromValue: application.stage,
      toValue: 'REJECTED',
      comment: params.feedback,
      reasonCategory: params.reason,
    });
    await this.stageLogRepo.save(log);

    // Create note
    const note = new Note();
    note.objectType = ObjectType.APPLICATION;
    note.objectId = params.applicationId;
    note.organizationId = params.organizationId;
    note.authorId = params.actorId;
    note.authorName = params.actorName;
    note.authorRole = params.actorRole || null;
    note.visibility = NoteVisibility.PUBLIC;
    note.bodyMd = `**Application Rejected**\n\nReason: ${params.reason}\n\n${params.feedback || ''}`;
    note.reasonCategory = params.reason;
    note.isSystemGenerated = false;
    note.eventType = 'APPLICATION_REJECTED';
    await this.noteRepo.save(note);

    this.logger.log(
      `Application ${params.applicationId} rejected by ${params.actorName}. Reason: ${params.reason}`
    );

    return saved;
  }

  /**
   * Bulk move applications
   */
  async bulkMoveStage(params: {
    applicationIds: string[];
    toStage: ApplicationStage;
    actorId: string;
    actorName: string;
    actorRole: string;
    comment?: string;
    organizationId: string;
  }): Promise<{ success: string[]; failed: Array<{ id: string; error: string }> }> {
    const success: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];

    for (const applicationId of params.applicationIds) {
      try {
        await this.moveStage({
          applicationId,
          toStage: params.toStage,
          actorId: params.actorId,
          actorName: params.actorName,
          actorRole: params.actorRole,
          comment: params.comment,
          organizationId: params.organizationId,
        });
        success.push(applicationId);
      } catch (error) {
        failed.push({ id: applicationId, error: error.message });
      }
    }

    return { success, failed };
  }

  /**
   * Get available transitions for current stage
   */
  getAvailableTransitions(currentStage: ApplicationStage, userRole: string): ApplicationStage[] {
    return this.transitions
      .filter(t => t.from === currentStage && t.allowedRoles.includes(userRole))
      .map(t => t.to);
  }

  /**
   * Check if transition is valid
   */
  isValidTransition(from: ApplicationStage, to: ApplicationStage, userRole: string): boolean {
    const transition = this.transitions.find(
      t => t.from === from && t.to === to && t.allowedRoles.includes(userRole)
    );
    return !!transition;
  }

  // Private helper methods

  private findTransition(from: ApplicationStage, to: ApplicationStage): StageTransition | undefined {
    return this.transitions.find(t => t.from === from && t.to === to);
  }

  private isBackwardTransition(from: ApplicationStage, to: ApplicationStage): boolean {
    const stages = Object.values(ApplicationStage);
    const fromIndex = stages.indexOf(from);
    const toIndex = stages.indexOf(to);
    return toIndex < fromIndex;
  }

  private async hasRequiredScorecards(applicationId: string): Promise<boolean> {
    // This would check if all interviewers have submitted scorecards
    // Implementation depends on Interview/Scorecard entities
    // For now, return true (implement in Phase 2)
    return true;
  }
}
