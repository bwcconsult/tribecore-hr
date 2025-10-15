import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interview, InterviewType } from '../entities/interview.entity';
import { Scorecard, ScorecardStatus } from '../entities/scorecard.entity';
import { Application } from '../entities/application.entity';
import { StageLog, ActionType } from '../entities/stage-log.entity';

export interface InterviewSlot {
  start: Date;
  end: Date;
  available: boolean;
  conflicts: string[];
}

export interface PanelMember {
  userId: string;
  name: string;
  role: string;
  email: string;
  isRequired: boolean;
}

export interface ScheduleInterviewParams {
  applicationId: string;
  type: InterviewType;
  panel: PanelMember[];
  start: Date;
  end: Date;
  location?: string;
  meetingLink?: string;
  interviewKitId?: string;
  organizationId: string;
  scheduledBy: string;
  scheduledByName: string;
}

@Injectable()
export class SchedulingService {
  private readonly logger = new Logger(SchedulingService.name);

  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepo: Repository<Interview>,
    @InjectRepository(Scorecard)
    private readonly scorecardRepo: Repository<Scorecard>,
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(StageLog)
    private readonly stageLogRepo: Repository<StageLog>,
  ) {}

  /**
   * Schedule an interview
   */
  async scheduleInterview(params: ScheduleInterviewParams): Promise<Interview> {
    // Validate application exists
    const application = await this.applicationRepo.findOne({
      where: { id: params.applicationId },
      relations: ['candidate'],
    });

    if (!application) {
      throw new BadRequestException('Application not found');
    }

    // Check for conflicts
    const conflicts = await this.checkPanelConflicts(params.panel, params.start, params.end);
    if (conflicts.length > 0) {
      const conflictNames = conflicts.map(c => c.name).join(', ');
      throw new BadRequestException(
        `Panel members have conflicts: ${conflictNames}. Use findAvailableSlots() to get availability.`
      );
    }

    // Create interview
    const interview = new Interview();
    interview.applicationId = params.applicationId;
    interview.organizationId = params.organizationId;
    interview.type = params.type;
    interview.panel = params.panel.map(p => ({
      userId: p.userId,
      name: p.name,
      role: p.role,
    }));
    interview.scheduledStart = params.start;
    interview.scheduledEnd = params.end;
    interview.location = params.location;
    interview.meetingLink = params.meetingLink;
    interview.interviewKitId = params.interviewKitId;
    interview.feedbackDueAt = this.calculateFeedbackDueDate(params.end);
    interview.scorecards = [];

    const saved = await this.interviewRepo.save(interview);

    // Create scorecards for each panelist
    await this.createScorecards(saved, params.panel);

    // Create stage log
    const log = StageLog.create({
      organizationId: params.organizationId,
      objectType: 'INTERVIEW',
      objectId: saved.id,
      applicationId: params.applicationId,
      candidateId: application.candidateId,
      actorId: params.scheduledBy,
      actorName: params.scheduledByName,
      action: ActionType.INTERVIEW_SCHEDULED,
      payload: {
        type: params.type,
        panelCount: params.panel.length,
        scheduledStart: params.start,
        scheduledEnd: params.end,
      },
    });
    await this.stageLogRepo.save(log);

    // Send notifications to panel & candidate (implement in Phase 5)
    this.logger.log(
      `Interview scheduled for application ${params.applicationId} with ${params.panel.length} panelists`
    );

    return saved;
  }

  /**
   * Reschedule an interview
   */
  async rescheduleInterview(params: {
    interviewId: string;
    newStart: Date;
    newEnd: Date;
    rescheduledBy: string;
    rescheduledByName: string;
    reason?: string;
    organizationId: string;
  }): Promise<Interview> {
    const interview = await this.interviewRepo.findOne({
      where: { id: params.interviewId },
    });

    if (!interview) {
      throw new BadRequestException('Interview not found');
    }

    // Check panel conflicts for new time
    const panelMembers: PanelMember[] = interview.panel.map(p => ({
      userId: p.userId,
      name: p.name,
      role: p.role,
      email: '',
      isRequired: true,
    }));

    const conflicts = await this.checkPanelConflicts(panelMembers, params.newStart, params.newEnd);
    if (conflicts.length > 0) {
      throw new BadRequestException(
        `Panel members have conflicts at new time: ${conflicts.map(c => c.name).join(', ')}`
      );
    }

    // Store old dates for audit
    const oldStart = interview.scheduledStart;
    const oldEnd = interview.scheduledEnd;

    // Update interview
    interview.scheduledStart = params.newStart;
    interview.scheduledEnd = params.newEnd;
    interview.feedbackDueAt = this.calculateFeedbackDueDate(params.newEnd);

    const saved = await this.interviewRepo.save(interview);

    // Update scorecard due dates
    await this.updateScorecardDueDates(params.interviewId, params.newEnd);

    // Create stage log
    const log = StageLog.create({
      organizationId: params.organizationId,
      objectType: 'INTERVIEW',
      objectId: params.interviewId,
      applicationId: interview.applicationId,
      actorId: params.rescheduledBy,
      actorName: params.rescheduledByName,
      action: ActionType.INTERVIEW_RESCHEDULED,
      comment: params.reason,
      payload: {
        oldStart,
        oldEnd,
        newStart: params.newStart,
        newEnd: params.newEnd,
      },
    });
    await this.stageLogRepo.save(log);

    // Send notifications (implement in Phase 5)
    this.logger.log(`Interview ${params.interviewId} rescheduled`);

    return saved;
  }

  /**
   * Cancel an interview
   */
  async cancelInterview(params: {
    interviewId: string;
    cancelledBy: string;
    cancelledByName: string;
    reason: string;
    organizationId: string;
  }): Promise<Interview> {
    const interview = await this.interviewRepo.findOne({
      where: { id: params.interviewId },
    });

    if (!interview) {
      throw new BadRequestException('Interview not found');
    }

    // Soft delete by setting outcome
    interview.outcome = 'NO' as any; // Mark as cancelled
    interview.consolidatedFeedback = `CANCELLED: ${params.reason}`;

    const saved = await this.interviewRepo.save(interview);

    // Cancel scorecards
    await this.cancelScorecards(params.interviewId);

    // Create stage log
    const log = StageLog.create({
      organizationId: params.organizationId,
      objectType: 'INTERVIEW',
      objectId: params.interviewId,
      applicationId: interview.applicationId,
      actorId: params.cancelledBy,
      actorName: params.cancelledByName,
      action: ActionType.INTERVIEW_CANCELLED,
      comment: params.reason,
    });
    await this.stageLogRepo.save(log);

    this.logger.log(`Interview ${params.interviewId} cancelled: ${params.reason}`);

    return saved;
  }

  /**
   * Find available time slots for panel
   */
  async findAvailableSlots(params: {
    panelUserIds: string[];
    durationMinutes: number;
    searchFromDate: Date;
    searchToDate: Date;
    workingHoursStart?: number; // 9 (9am)
    workingHoursEnd?: number; // 17 (5pm)
  }): Promise<InterviewSlot[]> {
    const workingStart = params.workingHoursStart || 9;
    const workingEnd = params.workingHoursEnd || 17;

    const slots: InterviewSlot[] = [];
    const slotDuration = params.durationMinutes * 60 * 1000; // to milliseconds

    // Get all interviews for panel members in date range
    const existingInterviews = await this.interviewRepo
      .createQueryBuilder('interview')
      .where('interview.scheduledStart BETWEEN :from AND :to', {
        from: params.searchFromDate,
        to: params.searchToDate,
      })
      .andWhere(
        `EXISTS (
          SELECT 1 FROM jsonb_array_elements(interview.panel) AS p
          WHERE p->>'userId' IN (:...userIds)
        )`,
        { userIds: params.panelUserIds }
      )
      .getMany();

    // Generate potential slots (every 30 minutes during working hours)
    let currentDate = new Date(params.searchFromDate);
    const endDate = new Date(params.searchToDate);

    while (currentDate < endDate) {
      // Skip weekends
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(workingStart, 0, 0, 0);
        continue;
      }

      // Check each 30-minute slot during working hours
      for (let hour = workingStart; hour < workingEnd; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotStart = new Date(currentDate);
          slotStart.setHours(hour, minute, 0, 0);
          const slotEnd = new Date(slotStart.getTime() + slotDuration);

          // Check if slot end exceeds working hours
          if (slotEnd.getHours() > workingEnd) {
            continue;
          }

          // Check for conflicts
          const conflicts = this.findConflicts(slotStart, slotEnd, existingInterviews, params.panelUserIds);

          slots.push({
            start: slotStart,
            end: slotEnd,
            available: conflicts.length === 0,
            conflicts,
          });
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(workingStart, 0, 0, 0);
    }

    // Return only available slots (or all if requested)
    return slots.filter(s => s.available).slice(0, 20); // Max 20 slots
  }

  /**
   * Get panel load (number of interviews per panelist)
   */
  async getPanelLoad(params: {
    panelUserIds: string[];
    fromDate: Date;
    toDate: Date;
  }): Promise<Map<string, number>> {
    const interviews = await this.interviewRepo
      .createQueryBuilder('interview')
      .where('interview.scheduledStart BETWEEN :from AND :to', {
        from: params.fromDate,
        to: params.toDate,
      })
      .getMany();

    const load = new Map<string, number>();
    params.panelUserIds.forEach(id => load.set(id, 0));

    for (const interview of interviews) {
      for (const panelist of interview.panel) {
        if (params.panelUserIds.includes(panelist.userId)) {
          load.set(panelist.userId, (load.get(panelist.userId) || 0) + 1);
        }
      }
    }

    return load;
  }

  /**
   * Suggest balanced panel (distribute load evenly)
   */
  async suggestBalancedPanel(params: {
    candidatePoolUserIds: string[];
    requiredPanelSize: number;
    interviewDate: Date;
    lookbackDays?: number;
  }): Promise<PanelMember[]> {
    const lookback = params.lookbackDays || 30;
    const fromDate = new Date(params.interviewDate);
    fromDate.setDate(fromDate.getDate() - lookback);

    // Get load for all candidates
    const load = await this.getPanelLoad({
      panelUserIds: params.candidatePoolUserIds,
      fromDate,
      toDate: params.interviewDate,
    });

    // Sort by load (ascending) and pick least loaded
    const sorted = Array.from(load.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, params.requiredPanelSize);

    // Return as PanelMember objects (you'd enrich with actual user data from DB)
    return sorted.map(([userId, _]) => ({
      userId,
      name: 'User Name', // TODO: Fetch from User service
      role: 'Interviewer',
      email: 'user@example.com',
      isRequired: true,
    }));
  }

  /**
   * Mark interview as completed
   */
  async completeInterview(params: {
    interviewId: string;
    completedBy: string;
    completedByName: string;
    organizationId: string;
  }): Promise<Interview> {
    const interview = await this.interviewRepo.findOne({
      where: { id: params.interviewId },
    });

    if (!interview) {
      throw new BadRequestException('Interview not found');
    }

    // Mark scorecards as overdue if not submitted
    await this.markOverdueScorecards(params.interviewId);

    // Create stage log
    const log = StageLog.create({
      organizationId: params.organizationId,
      objectType: 'INTERVIEW',
      objectId: params.interviewId,
      applicationId: interview.applicationId,
      actorId: params.completedBy,
      actorName: params.completedByName,
      action: ActionType.INTERVIEW_COMPLETED,
    });
    await this.stageLogRepo.save(log);

    return interview;
  }

  // Private helper methods

  private async checkPanelConflicts(
    panel: PanelMember[],
    start: Date,
    end: Date
  ): Promise<PanelMember[]> {
    const userIds = panel.map(p => p.userId);

    const conflicts = await this.interviewRepo
      .createQueryBuilder('interview')
      .where(
        `(interview.scheduledStart < :end AND interview.scheduledEnd > :start)`,
        { start, end }
      )
      .andWhere(
        `EXISTS (
          SELECT 1 FROM jsonb_array_elements(interview.panel) AS p
          WHERE p->>'userId' IN (:...userIds)
        )`,
        { userIds }
      )
      .getMany();

    if (conflicts.length === 0) return [];

    // Find which panel members have conflicts
    const conflictedUserIds = new Set<string>();
    for (const conflict of conflicts) {
      for (const p of conflict.panel) {
        if (userIds.includes(p.userId)) {
          conflictedUserIds.add(p.userId);
        }
      }
    }

    return panel.filter(p => conflictedUserIds.has(p.userId));
  }

  private findConflicts(
    slotStart: Date,
    slotEnd: Date,
    existingInterviews: Interview[],
    panelUserIds: string[]
  ): string[] {
    const conflicts: string[] = [];

    for (const interview of existingInterviews) {
      const intStart = new Date(interview.scheduledStart);
      const intEnd = new Date(interview.scheduledEnd);

      // Check for overlap
      if (slotStart < intEnd && slotEnd > intStart) {
        // Find which panel members are in conflict
        for (const panelist of interview.panel) {
          if (panelUserIds.includes(panelist.userId)) {
            conflicts.push(panelist.name);
          }
        }
      }
    }

    return [...new Set(conflicts)]; // Deduplicate
  }

  private calculateFeedbackDueDate(interviewEnd: Date): Date {
    const due = new Date(interviewEnd);
    due.setHours(due.getHours() + 24); // 24 hours after interview
    return due;
  }

  private async createScorecards(interview: Interview, panel: PanelMember[]): Promise<void> {
    const scorecards: Scorecard[] = [];

    for (const panelist of panel) {
      const scorecard = new Scorecard();
      scorecard.interviewId = interview.id;
      scorecard.applicationId = interview.applicationId;
      scorecard.organizationId = interview.organizationId;
      scorecard.interviewerId = panelist.userId;
      scorecard.interviewerName = panelist.name;
      scorecard.interviewerRole = panelist.role;
      scorecard.status = ScorecardStatus.PENDING;
      scorecard.dueAt = interview.feedbackDueAt;
      scorecard.competencies = []; // Will be populated from interview kit
      scorecards.push(scorecard);
    }

    await this.scorecardRepo.save(scorecards);
  }

  private async updateScorecardDueDates(interviewId: string, newEnd: Date): Promise<void> {
    const newDue = this.calculateFeedbackDueDate(newEnd);

    await this.scorecardRepo
      .createQueryBuilder()
      .update(Scorecard)
      .set({ dueAt: newDue })
      .where('interviewId = :interviewId', { interviewId })
      .execute();
  }

  private async cancelScorecards(interviewId: string): Promise<void> {
    // Mark scorecards as cancelled (you might add a CANCELLED status)
    await this.scorecardRepo
      .createQueryBuilder()
      .update(Scorecard)
      .set({ status: ScorecardStatus.OVERDUE })
      .where('interviewId = :interviewId', { interviewId })
      .execute();
  }

  private async markOverdueScorecards(interviewId: string): Promise<void> {
    const scorecards = await this.scorecardRepo.find({
      where: { interviewId },
    });

    for (const scorecard of scorecards) {
      scorecard.markOverdue();
    }

    await this.scorecardRepo.save(scorecards);
  }
}
