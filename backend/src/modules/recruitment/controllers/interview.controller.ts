import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Interview, InterviewType } from '../entities/interview.entity';
import { Scorecard, ScorecardStatus, Recommendation } from '../entities/scorecard.entity';
import { SchedulingService } from '../services/scheduling.service';
import { RecruitmentNotificationService } from '../services/recruitment-notification.service';

@Controller('api/v1/recruitment/interviews')
@UseGuards(JwtAuthGuard)
export class InterviewController {
  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepo: Repository<Interview>,
    @InjectRepository(Scorecard)
    private readonly scorecardRepo: Repository<Scorecard>,
    private readonly schedulingService: SchedulingService,
    private readonly notificationService: RecruitmentNotificationService,
  ) {}

  /**
   * Schedule new interview
   * POST /api/v1/recruitment/interviews
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: any, @Req() req: any) {
    const interview = await this.schedulingService.scheduleInterview({
      applicationId: dto.applicationId,
      type: dto.type,
      panel: dto.panel,
      start: new Date(dto.start),
      end: new Date(dto.end),
      location: dto.location,
      meetingLink: dto.meetingLink,
      interviewKitId: dto.interviewKitId,
      organizationId: req.user.organizationId,
      scheduledBy: req.user.id,
      scheduledByName: req.user.name,
    });

    // Notify panel members
    await this.notificationService.notifyInterviewScheduled({
      applicationId: dto.applicationId,
      candidateName: 'Candidate Name', // TODO: Get from application
      jobTitle: 'Job Title',
      interviewType: dto.type,
      interviewDate: new Date(dto.start),
      panelUserIds: dto.panel.map((p: any) => p.userId),
      organizationId: req.user.organizationId,
    });

    return interview;
  }

  /**
   * Get all interviews with filters
   * GET /api/v1/recruitment/interviews?applicationId=xxx&date=2024-01-01
   */
  @Get()
  async findAll(@Query() query: any, @Req() req: any) {
    const {
      applicationId,
      interviewerId,
      type,
      fromDate,
      toDate,
      outcome,
      page = 1,
      limit = 20,
    } = query;

    const qb = this.interviewRepo
      .createQueryBuilder('interview')
      .where('interview.organizationId = :organizationId', {
        organizationId: req.user.organizationId,
      });

    if (applicationId) {
      qb.andWhere('interview.applicationId = :applicationId', { applicationId });
    }

    if (interviewerId) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM jsonb_array_elements(interview.panel) AS p
          WHERE p->>'userId' = :interviewerId
        )`,
        { interviewerId }
      );
    }

    if (type) {
      qb.andWhere('interview.type = :type', { type });
    }

    if (fromDate) {
      qb.andWhere('interview.scheduledStart >= :fromDate', { fromDate });
    }

    if (toDate) {
      qb.andWhere('interview.scheduledStart <= :toDate', { toDate });
    }

    if (outcome) {
      qb.andWhere('interview.outcome = :outcome', { outcome });
    }

    qb.orderBy('interview.scheduledStart', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single interview
   * GET /api/v1/recruitment/interviews/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const interview = await this.interviewRepo.findOne({
      where: {
        id,
        organizationId: req.user.organizationId,
      },
    });

    if (!interview) {
      throw new Error('Interview not found');
    }

    // Get associated scorecards
    const scorecards = await this.scorecardRepo.find({
      where: { interviewId: id },
    });

    return { ...interview, scorecards };
  }

  /**
   * Reschedule interview
   * PATCH /api/v1/recruitment/interviews/:id/reschedule
   */
  @Patch(':id/reschedule')
  async reschedule(
    @Param('id') id: string,
    @Body() dto: { newStart: string; newEnd: string; reason?: string },
    @Req() req: any,
  ) {
    return await this.schedulingService.rescheduleInterview({
      interviewId: id,
      newStart: new Date(dto.newStart),
      newEnd: new Date(dto.newEnd),
      rescheduledBy: req.user.id,
      rescheduledByName: req.user.name,
      reason: dto.reason,
      organizationId: req.user.organizationId,
    });
  }

  /**
   * Cancel interview
   * DELETE /api/v1/recruitment/interviews/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    await this.schedulingService.cancelInterview({
      interviewId: id,
      cancelledBy: req.user.id,
      cancelledByName: req.user.name,
      reason,
      organizationId: req.user.organizationId,
    });
  }

  /**
   * Find available slots for panel
   * POST /api/v1/recruitment/interviews/available-slots
   */
  @Post('available-slots')
  async findAvailableSlots(@Body() dto: any) {
    return await this.schedulingService.findAvailableSlots({
      panelUserIds: dto.panelUserIds,
      durationMinutes: dto.durationMinutes || 60,
      searchFromDate: new Date(dto.searchFromDate),
      searchToDate: new Date(dto.searchToDate),
      workingHoursStart: dto.workingHoursStart,
      workingHoursEnd: dto.workingHoursEnd,
    });
  }

  /**
   * Get panel load (interviews per panelist)
   * POST /api/v1/recruitment/interviews/panel-load
   */
  @Post('panel-load')
  async getPanelLoad(@Body() dto: any) {
    const load = await this.schedulingService.getPanelLoad({
      panelUserIds: dto.panelUserIds,
      fromDate: new Date(dto.fromDate),
      toDate: new Date(dto.toDate),
    });

    return Object.fromEntries(load);
  }

  /**
   * Suggest balanced panel
   * POST /api/v1/recruitment/interviews/suggest-panel
   */
  @Post('suggest-panel')
  async suggestPanel(@Body() dto: any) {
    return await this.schedulingService.suggestBalancedPanel({
      candidatePoolUserIds: dto.candidatePoolUserIds,
      requiredPanelSize: dto.requiredPanelSize || 3,
      interviewDate: new Date(dto.interviewDate),
      lookbackDays: dto.lookbackDays,
    });
  }

  /**
   * Mark interview as completed
   * POST /api/v1/recruitment/interviews/:id/complete
   */
  @Post(':id/complete')
  async complete(@Param('id') id: string, @Req() req: any) {
    return await this.schedulingService.completeInterview({
      interviewId: id,
      completedBy: req.user.id,
      completedByName: req.user.name,
      organizationId: req.user.organizationId,
    });
  }

  /**
   * Get my upcoming interviews
   * GET /api/v1/recruitment/interviews/my-interviews/upcoming
   */
  @Get('my-interviews/upcoming')
  async getMyUpcomingInterviews(@Req() req: any) {
    const now = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    const interviews = await this.interviewRepo
      .createQueryBuilder('interview')
      .where('interview.organizationId = :organizationId', {
        organizationId: req.user.organizationId,
      })
      .andWhere('interview.scheduledStart >= :now', { now })
      .andWhere('interview.scheduledStart <= :oneMonthFromNow', { oneMonthFromNow })
      .andWhere(
        `EXISTS (
          SELECT 1 FROM jsonb_array_elements(interview.panel) AS p
          WHERE p->>'userId' = :userId
        )`,
        { userId: req.user.id }
      )
      .orderBy('interview.scheduledStart', 'ASC')
      .getMany();

    return interviews;
  }

  /**
   * Get my pending scorecards
   * GET /api/v1/recruitment/interviews/my-scorecards/pending
   */
  @Get('my-scorecards/pending')
  async getMyPendingScorecards(@Req() req: any) {
    return await this.scorecardRepo.find({
      where: {
        organizationId: req.user.organizationId,
        interviewerId: req.user.id,
        status: ScorecardStatus.PENDING,
      },
      order: { dueAt: 'ASC' },
    });
  }

  /**
   * Submit scorecard
   * POST /api/v1/recruitment/interviews/scorecards/:scorecardId/submit
   */
  @Post('scorecards/:scorecardId/submit')
  async submitScorecard(
    @Param('scorecardId') scorecardId: string,
    @Body() dto: {
      competencies: any[];
      recommendation: Recommendation;
      strengths: string;
      weaknesses: string;
      cultureFitNotes?: string;
      nextStepsRecommendation?: string;
      flags?: any[];
    },
    @Req() req: any,
  ) {
    const scorecard = await this.scorecardRepo.findOne({
      where: {
        id: scorecardId,
        organizationId: req.user.organizationId,
        interviewerId: req.user.id,
      },
    });

    if (!scorecard) {
      throw new Error('Scorecard not found or access denied');
    }

    if (scorecard.status === ScorecardStatus.SUBMITTED) {
      throw new Error('Scorecard already submitted');
    }

    // Update scorecard
    scorecard.competencies = dto.competencies;
    scorecard.recommendation = dto.recommendation;
    scorecard.strengths = dto.strengths;
    scorecard.weaknesses = dto.weaknesses;
    if (dto.cultureFitNotes) scorecard.cultureFitNotes = dto.cultureFitNotes;
    if (dto.nextStepsRecommendation) scorecard.nextStepsRecommendation = dto.nextStepsRecommendation;
    scorecard.flags = dto.flags || [];
    scorecard.status = ScorecardStatus.SUBMITTED;
    scorecard.submittedAt = new Date();

    // Calculate overall score
    scorecard.overallScore = scorecard.calculateWeightedScore();

    return await this.scorecardRepo.save(scorecard);
  }

  /**
   * Get scorecard
   * GET /api/v1/recruitment/interviews/scorecards/:scorecardId
   */
  @Get('scorecards/:scorecardId')
  async getScorecard(@Param('scorecardId') scorecardId: string, @Req() req: any) {
    return await this.scorecardRepo.findOne({
      where: {
        id: scorecardId,
        organizationId: req.user.organizationId,
      },
    });
  }

  /**
   * Update scorecard (draft)
   * PATCH /api/v1/recruitment/interviews/scorecards/:scorecardId
   */
  @Patch('scorecards/:scorecardId')
  async updateScorecard(
    @Param('scorecardId') scorecardId: string,
    @Body() dto: any,
    @Req() req: any,
  ) {
    const scorecard = await this.scorecardRepo.findOne({
      where: {
        id: scorecardId,
        organizationId: req.user.organizationId,
        interviewerId: req.user.id,
      },
    });

    if (!scorecard) {
      throw new Error('Scorecard not found or access denied');
    }

    if (scorecard.status === ScorecardStatus.SUBMITTED) {
      throw new Error('Cannot edit submitted scorecard');
    }

    Object.assign(scorecard, dto);
    scorecard.status = ScorecardStatus.IN_PROGRESS;

    return await this.scorecardRepo.save(scorecard);
  }

  /**
   * Get interview statistics
   * GET /api/v1/recruitment/interviews/stats/summary
   */
  @Get('stats/summary')
  async getStats(@Req() req: any) {
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [
      totalUpcoming,
      totalPastWeek,
      pendingScorecards,
      overdueScorecards,
    ] = await Promise.all([
      this.interviewRepo.count({
        where: {
          organizationId: req.user.organizationId,
          // scheduledStart >= now
        },
      }),
      this.interviewRepo.count({
        where: {
          organizationId: req.user.organizationId,
          // scheduledStart between oneWeekAgo and now
        },
      }),
      this.scorecardRepo.count({
        where: {
          organizationId: req.user.organizationId,
          status: ScorecardStatus.PENDING,
        },
      }),
      this.scorecardRepo.count({
        where: {
          organizationId: req.user.organizationId,
          status: ScorecardStatus.OVERDUE,
        },
      }),
    ]);

    return {
      totalUpcoming,
      totalPastWeek,
      pendingScorecards,
      overdueScorecards,
    };
  }
}
