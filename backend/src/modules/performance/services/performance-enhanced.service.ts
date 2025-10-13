import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan, MoreThan } from 'typeorm';
import {
  Objective,
  ObjectiveStatus,
  ConfidenceLevel,
} from '../entities/objective.entity';
import { ObjectiveMilestone } from '../entities/objective-milestone.entity';
import { Action, ActionStatus, ActionSourceType } from '../entities/action.entity';
import { OneOnOne, OneOnOneStatus } from '../entities/one-on-one.entity';
import { OneOnOneAgendaItem, AgendaItemType } from '../entities/one-on-one-agenda-item.entity';
import { Feedback } from '../entities/feedback.entity';
import { Recognition } from '../entities/recognition.entity';
import { WellbeingCheck } from '../entities/wellbeing-check.entity';
import { ReviewCycle, ReviewCycleStatus } from '../entities/review-cycle.entity';
import { ReviewForm, ReviewFormStatus } from '../entities/review-form.entity';
import { CalibrationRecord } from '../entities/calibration-record.entity';
import { Competency } from '../entities/competency.entity';
import { PIP, PIPStatus } from '../entities/pip.entity';
import { TalentCard } from '../entities/talent-card.entity';
import { Nudge, NudgeType, NudgeStatus, NudgePriority } from '../entities/nudge.entity';
import {
  CreateObjectiveDto,
  UpdateObjectiveDto,
  CheckInObjectiveDto,
  CreateMilestoneDto,
  CreateActionDto,
  UpdateActionDto,
  BulkCompleteActionsDto,
  CreateOneOnOneDto,
  UpdateOneOnOneDto,
  AddAgendaItemDto,
  CompleteOneOnOneDto,
  CreateFeedbackDto,
  CreateRecognitionDto,
  CreateWellbeingCheckDto,
  CreateReviewCycleDto,
  SubmitReviewFormDto,
  CalibrateEmployeeDto,
  BatchCalibrateDto,
  CreatePIPDto,
  UpdatePIPDto,
} from '../dto/performance-enhanced.dto';

@Injectable()
export class PerformanceEnhancedService {
  constructor(
    @InjectRepository(Objective)
    private objectiveRepo: Repository<Objective>,
    @InjectRepository(ObjectiveMilestone)
    private milestoneRepo: Repository<ObjectiveMilestone>,
    @InjectRepository(Action)
    private actionRepo: Repository<Action>,
    @InjectRepository(OneOnOne)
    private oneOnOneRepo: Repository<OneOnOne>,
    @InjectRepository(OneOnOneAgendaItem)
    private agendaItemRepo: Repository<OneOnOneAgendaItem>,
    @InjectRepository(Feedback)
    private feedbackRepo: Repository<Feedback>,
    @InjectRepository(Recognition)
    private recognitionRepo: Repository<Recognition>,
    @InjectRepository(WellbeingCheck)
    private wellbeingRepo: Repository<WellbeingCheck>,
    @InjectRepository(ReviewCycle)
    private reviewCycleRepo: Repository<ReviewCycle>,
    @InjectRepository(ReviewForm)
    private reviewFormRepo: Repository<ReviewForm>,
    @InjectRepository(CalibrationRecord)
    private calibrationRepo: Repository<CalibrationRecord>,
    @InjectRepository(Competency)
    private competencyRepo: Repository<Competency>,
    @InjectRepository(PIP)
    private pipRepo: Repository<PIP>,
    @InjectRepository(TalentCard)
    private talentCardRepo: Repository<TalentCard>,
    @InjectRepository(Nudge)
    private nudgeRepo: Repository<Nudge>,
  ) {}

  // ============ OBJECTIVE METHODS ============
  async createObjective(dto: CreateObjectiveDto): Promise<Objective> {
    const objective = this.objectiveRepo.create({
      ...dto,
      status: ObjectiveStatus.DRAFT,
      progress: 0,
      confidence: ConfidenceLevel.MEDIUM,
    });
    return this.objectiveRepo.save(objective);
  }

  async getObjectives(filters: {
    ownerId?: string;
    status?: ObjectiveStatus;
    alignedTo?: string;
  }): Promise<Objective[]> {
    const query = this.objectiveRepo.createQueryBuilder('obj').leftJoinAndSelect('obj.owner', 'owner');

    if (filters.ownerId) {
      query.andWhere('obj.ownerId = :ownerId', { ownerId: filters.ownerId });
    }
    if (filters.status) {
      query.andWhere('obj.status = :status', { status: filters.status });
    }
    if (filters.alignedTo) {
      query.andWhere('obj.parentId = :parentId', { parentId: filters.alignedTo });
    }

    return query.orderBy('obj.dueDate', 'ASC').getMany();
  }

  async getObjectiveById(id: string): Promise<Objective> {
    const objective = await this.objectiveRepo.findOne({
      where: { id },
      relations: ['owner', 'creator', 'parent', 'children'],
    });

    if (!objective) {
      throw new NotFoundException('Objective not found');
    }

    return objective;
  }

  async updateObjective(id: string, dto: UpdateObjectiveDto): Promise<Objective> {
    const objective = await this.getObjectiveById(id);
    Object.assign(objective, dto);
    return this.objectiveRepo.save(objective);
  }

  async checkInObjective(id: string, dto: CheckInObjectiveDto): Promise<Objective> {
    const objective = await this.getObjectiveById(id);

    objective.progress = dto.progress;
    objective.confidence = dto.confidence;
    if (dto.blockers !== undefined) objective.blockers = dto.blockers;
    if (dto.evidenceLinks !== undefined) objective.evidenceLinks = dto.evidenceLinks;
    objective.discussInNextOneOnOne = dto.discussInNextOneOnOne || false;
    objective.lastCheckInAt = new Date();

    // Auto-update status based on progress and confidence
    objective.status = this.calculateObjectiveStatus(objective);

    const saved = await this.objectiveRepo.save(objective);

    // Create nudge if at risk
    if (objective.status === ObjectiveStatus.AT_RISK) {
      await this.createNudge({
        userId: objective.ownerId,
        type: NudgeType.OBJECTIVE_AT_RISK,
        title: 'Objective At Risk',
        message: `Your objective "${objective.title}" is at risk. Consider adding it to your next 1:1.`,
        priority: NudgePriority.HIGH,
        relatedEntityType: 'Objective',
        relatedEntityId: objective.id,
        actions: [{ label: 'View Objective', url: `/performance/objectives/${id}`, action: 'view' }],
      });
    }

    return saved;
  }

  private calculateObjectiveStatus(objective: Objective): ObjectiveStatus {
    if (objective.confidence === ConfidenceLevel.LOW) {
      return ObjectiveStatus.AT_RISK;
    }

    const daysUntilDue = Math.floor(
      (new Date(objective.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntilDue < 30 && objective.progress < 70) {
      return ObjectiveStatus.AT_RISK;
    }

    if (objective.progress >= 100) {
      return ObjectiveStatus.COMPLETED;
    }

    return ObjectiveStatus.ON_TRACK;
  }

  async activateObjective(id: string, approverId: string): Promise<Objective> {
    const objective = await this.getObjectiveById(id);

    if (objective.status !== ObjectiveStatus.DRAFT) {
      throw new BadRequestException('Only draft objectives can be activated');
    }

    objective.status = ObjectiveStatus.ACTIVE;
    objective.metadata = {
      ...objective.metadata,
      approvedBy: approverId,
      approvedAt: new Date(),
    };

    return this.objectiveRepo.save(objective);
  }

  // ============ MILESTONE METHODS ============
  async createMilestone(dto: CreateMilestoneDto): Promise<ObjectiveMilestone> {
    const milestone = this.milestoneRepo.create(dto);
    return this.milestoneRepo.save(milestone);
  }

  async getMilestones(objectiveId: string): Promise<ObjectiveMilestone[]> {
    return this.milestoneRepo.find({
      where: { objectiveId },
      order: { orderIndex: 'ASC' },
    });
  }

  // ============ ACTION METHODS ============
  async createAction(dto: CreateActionDto): Promise<Action> {
    const action = this.actionRepo.create({
      ...dto,
      status: ActionStatus.OPEN,
    });
    return this.actionRepo.save(action);
  }

  async getActions(filters: {
    ownerId?: string;
    status?: ActionStatus;
    sourceType?: ActionSourceType;
  }): Promise<Action[]> {
    const where: any = {};

    if (filters.ownerId) where.ownerId = filters.ownerId;
    if (filters.status) where.status = filters.status;
    if (filters.sourceType) where.sourceType = filters.sourceType;

    return this.actionRepo.find({
      where,
      relations: ['owner', 'assigner'],
      order: { dueDate: 'ASC', priority: 'DESC' },
    });
  }

  async updateAction(id: string, dto: UpdateActionDto): Promise<Action> {
    const action = await this.actionRepo.findOne({ where: { id } });
    if (!action) {
      throw new NotFoundException('Action not found');
    }

    Object.assign(action, dto);

    if (dto.status === ActionStatus.COMPLETED) {
      action.completedAt = new Date();
    }

    return this.actionRepo.save(action);
  }

  async bulkCompleteActions(dto: BulkCompleteActionsDto): Promise<{ completed: number }> {
    await this.actionRepo.update(
      { id: In(dto.actionIds) },
      {
        status: ActionStatus.COMPLETED,
        completedAt: new Date(),
      },
    );

    return { completed: dto.actionIds.length };
  }

  // ============ 1:1 METHODS ============
  async createOneOnOne(dto: CreateOneOnOneDto): Promise<OneOnOne> {
    const oneOnOne = this.oneOnOneRepo.create({
      ...dto,
      status: OneOnOneStatus.SCHEDULED,
      durationMinutes: dto.durationMinutes || 30,
    });

    const saved = await this.oneOnOneRepo.save(oneOnOne);

    // Auto-generate agenda if requested
    if (dto.autoGenerateAgenda) {
      await this.generateAgenda(saved.id, dto.employeeId);
    }

    return saved;
  }

  async generateAgenda(oneOnOneId: string, employeeId: string): Promise<void> {
    let orderIndex = 0;

    // Add at-risk objectives
    const atRiskObjectives = await this.objectiveRepo.find({
      where: {
        ownerId: employeeId,
        status: ObjectiveStatus.AT_RISK,
      },
      take: 3,
    });

    for (const obj of atRiskObjectives) {
      await this.agendaItemRepo.save({
        oneOnOneId,
        type: AgendaItemType.OBJECTIVE,
        refId: obj.id,
        title: `At Risk: ${obj.title}`,
        orderIndex: orderIndex++,
        isAutoGenerated: true,
      });
    }

    // Add objectives flagged for discussion
    const discussObjectives = await this.objectiveRepo.find({
      where: {
        ownerId: employeeId,
        discussInNextOneOnOne: true,
      },
      take: 3,
    });

    for (const obj of discussObjectives) {
      await this.agendaItemRepo.save({
        oneOnOneId,
        type: AgendaItemType.OBJECTIVE,
        refId: obj.id,
        title: obj.title,
        orderIndex: orderIndex++,
        isAutoGenerated: true,
      });
    }

    // Add overdue actions
    const overdueActions = await this.actionRepo.find({
      where: {
        ownerId: employeeId,
        status: ActionStatus.OPEN,
        dueDate: LessThan(new Date()),
      },
      take: 3,
    });

    for (const action of overdueActions) {
      await this.agendaItemRepo.save({
        oneOnOneId,
        type: AgendaItemType.ACTION,
        refId: action.id,
        title: `Overdue: ${action.title}`,
        orderIndex: orderIndex++,
        isAutoGenerated: true,
      });
    }

    // Add recent wellbeing if flagged
    const recentWellbeing = await this.wellbeingRepo.findOne({
      where: {
        userId: employeeId,
        flaggedForReview: true,
      },
      order: { createdAt: 'DESC' },
    });

    if (recentWellbeing) {
      await this.agendaItemRepo.save({
        oneOnOneId,
        type: AgendaItemType.WELLBEING,
        refId: recentWellbeing.id,
        title: 'Wellbeing Check-in',
        orderIndex: orderIndex++,
        isAutoGenerated: true,
      });
    }
  }

  async getOneOnOnes(filters: { employeeId?: string; managerId?: string; status?: OneOnOneStatus }): Promise<OneOnOne[]> {
    const query = this.oneOnOneRepo
      .createQueryBuilder('ooo')
      .leftJoinAndSelect('ooo.employee', 'employee')
      .leftJoinAndSelect('ooo.manager', 'manager')
      .leftJoinAndSelect('ooo.agendaItems', 'agenda');

    if (filters.employeeId) {
      query.andWhere('ooo.employeeId = :employeeId', { employeeId: filters.employeeId });
    }
    if (filters.managerId) {
      query.andWhere('ooo.managerId = :managerId', { managerId: filters.managerId });
    }
    if (filters.status) {
      query.andWhere('ooo.status = :status', { status: filters.status });
    }

    return query.orderBy('ooo.scheduledAt', 'DESC').getMany();
  }

  async completeOneOnOne(id: string, dto: CompleteOneOnOneDto): Promise<OneOnOne> {
    const oneOnOne = await this.oneOnOneRepo.findOne({ where: { id } });
    if (!oneOnOne) {
      throw new NotFoundException('1:1 not found');
    }

    oneOnOne.status = OneOnOneStatus.COMPLETED;
    oneOnOne.completedAt = new Date();
    if (dto.notes !== undefined) oneOnOne.notes = dto.notes;
    oneOnOne.decisions = dto.decisions || [];

    const saved = await this.oneOnOneRepo.save(oneOnOne);

    // Create actions from decisions
    if (dto.decisions) {
      for (const decision of dto.decisions) {
        await this.createAction({
          ownerId: decision.owner,
          sourceType: ActionSourceType.ONE_ON_ONE,
          sourceId: id,
          title: decision.decision,
          dueDate: decision.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 1 week
        });
      }
    }

    return saved;
  }

  // ============ FEEDBACK METHODS ============
  async createFeedback(dto: CreateFeedbackDto): Promise<Feedback> {
    const feedback = this.feedbackRepo.create(dto);
    return this.feedbackRepo.save(feedback);
  }

  async getFeedback(filters: { toUserId?: string; fromUserId?: string }): Promise<Feedback[]> {
    const where: any = {};
    if (filters.toUserId) where.toUserId = filters.toUserId;
    if (filters.fromUserId) where.fromUserId = filters.fromUserId;

    return this.feedbackRepo.find({
      where,
      relations: ['fromUser', 'toUser'],
      order: { createdAt: 'DESC' },
    });
  }

  // ============ RECOGNITION METHODS ============
  async createRecognition(dto: CreateRecognitionDto): Promise<Recognition> {
    const recognition = this.recognitionRepo.create(dto);
    const saved = await this.recognitionRepo.save(recognition);

    // TODO: Integrate with Slack/Teams if requested
    // if (dto.shareToSlack) { await this.slackService.postRecognition(saved); }

    return saved;
  }

  async getRecognition(userId: string): Promise<Recognition[]> {
    return this.recognitionRepo.find({
      where: [{ toUserId: userId }, { fromUserId: userId }],
      relations: ['fromUser', 'toUser'],
      order: { createdAt: 'DESC' },
    });
  }

  // ============ WELLBEING METHODS ============
  async createWellbeingCheck(dto: CreateWellbeingCheckDto): Promise<WellbeingCheck> {
    const check = this.wellbeingRepo.create(dto);

    // Auto-flag if scores are low
    const avgScore = (dto.happiness + dto.motivation + dto.workLifeBalance) / 3;
    if (avgScore < 5 || dto.requestsSupport) {
      check.flaggedForReview = true;
    }

    return this.wellbeingRepo.save(check);
  }

  async getWellbeingChecks(userId: string, limit = 10): Promise<WellbeingCheck[]> {
    return this.wellbeingRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getWellbeingTrend(userId: string): Promise<any> {
    const checks = await this.wellbeingRepo.find({
      where: { userId },
      order: { createdAt: 'ASC' },
      take: 12, // Last 12 weeks
    });

    return {
      happiness: checks.map((c) => ({ date: c.createdAt, value: c.happiness })),
      motivation: checks.map((c) => ({ date: c.createdAt, value: c.motivation })),
      workLifeBalance: checks.map((c) => ({ date: c.createdAt, value: c.workLifeBalance })),
    };
  }

  // ============ REVIEW CYCLE METHODS ============
  async createReviewCycle(dto: CreateReviewCycleDto): Promise<ReviewCycle> {
    const cycle = this.reviewCycleRepo.create({
      ...dto,
      status: ReviewCycleStatus.DRAFT,
    });
    return this.reviewCycleRepo.save(cycle);
  }

  async getReviewCycles(): Promise<ReviewCycle[]> {
    return this.reviewCycleRepo.find({ order: { createdAt: 'DESC' } });
  }

  async publishReviewCycle(cycleId: string): Promise<ReviewCycle> {
    const cycle = await this.reviewCycleRepo.findOne({ where: { id: cycleId } });
    if (!cycle) {
      throw new NotFoundException('Review cycle not found');
    }

    cycle.status = ReviewCycleStatus.PUBLISHED;
    cycle.publishDate = new Date();

    return this.reviewCycleRepo.save(cycle);
  }

  // ============ DASHBOARD METHODS ============
  async getEmployeeDashboard(userId: string): Promise<any> {
    const objectives = await this.objectiveRepo.find({
      where: { ownerId: userId },
    });

    const actions = await this.actionRepo.find({
      where: { ownerId: userId, status: ActionStatus.OPEN },
    });

    const feedback = await this.feedbackRepo.find({
      where: { toUserId: userId },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const recognition = await this.recognitionRepo.find({
      where: { toUserId: userId },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const wellbeing = await this.wellbeingRepo.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const upcomingOneOnOne = await this.oneOnOneRepo.findOne({
      where: {
        employeeId: userId,
        status: OneOnOneStatus.SCHEDULED,
        scheduledAt: MoreThan(new Date()),
      },
      order: { scheduledAt: 'ASC' },
    });

    return {
      objectives: {
        total: objectives.length,
        active: objectives.filter((o) => o.status === ObjectiveStatus.ACTIVE || o.status === ObjectiveStatus.ON_TRACK).length,
        atRisk: objectives.filter((o) => o.status === ObjectiveStatus.AT_RISK).length,
        completed: objectives.filter((o) => o.status === ObjectiveStatus.COMPLETED).length,
      },
      actions: {
        total: actions.length,
        overdue: actions.filter((a) => new Date(a.dueDate) < new Date()).length,
      },
      feedback: {
        recent: feedback,
        count: feedback.length,
      },
      recognition: {
        recent: recognition,
        count: recognition.length,
      },
      wellbeing: wellbeing
        ? {
            happiness: wellbeing.happiness,
            motivation: wellbeing.motivation,
            workLifeBalance: wellbeing.workLifeBalance,
            lastUpdated: wellbeing.createdAt,
          }
        : null,
      upcomingOneOnOne,
    };
  }

  // ============ NUDGE METHODS ============
  private async createNudge(data: Partial<Nudge>): Promise<Nudge> {
    const nudge = this.nudgeRepo.create({
      ...data,
      status: NudgeStatus.PENDING,
    });
    return this.nudgeRepo.save(nudge);
  }

  async getNudges(userId: string): Promise<Nudge[]> {
    return this.nudgeRepo.find({
      where: {
        userId,
        status: In([NudgeStatus.PENDING, NudgeStatus.SENT, NudgeStatus.VIEWED]),
      },
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }

  async dismissNudge(id: string): Promise<void> {
    await this.nudgeRepo.update(id, {
      status: NudgeStatus.DISMISSED,
      dismissedAt: new Date(),
    });
  }
}
