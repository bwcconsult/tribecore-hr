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
import { Repository, In } from 'typeorm';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Application, ApplicationStage, ApplicationStatus } from '../entities/application.entity';
import { WorkflowService } from '../services/workflow.service';
import { AIScoringService } from '../services/ai-scoring.service';
import { RecruitmentNotificationService } from '../services/recruitment-notification.service';

@Controller('api/v1/recruitment/applications')
@UseGuards(JwtAuthGuard)
export class ApplicationController {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    private readonly workflowService: WorkflowService,
    private readonly aiScoringService: AIScoringService,
    private readonly notificationService: RecruitmentNotificationService,
  ) {}

  /**
   * Get all applications with filters
   * GET /api/v1/recruitment/applications?stage=INTERVIEW&status=ACTIVE
   */
  @Get()
  async findAll(@Query() query: any, @Req() req: any) {
    const {
      jobPostingId,
      requisitionId,
      candidateId,
      stage,
      status,
      tags,
      minScore,
      search,
      page = 1,
      limit = 20,
    } = query;

    const qb = this.applicationRepo
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.candidate', 'candidate')
      .leftJoinAndSelect('app.jobPosting', 'jobPosting')
      .where('app.organizationId = :organizationId', {
        organizationId: req.user.organizationId,
      });

    if (jobPostingId) {
      qb.andWhere('app.jobPostingId = :jobPostingId', { jobPostingId });
    }

    if (requisitionId) {
      qb.andWhere('jobPosting.requisitionId = :requisitionId', { requisitionId });
    }

    if (candidateId) {
      qb.andWhere('app.candidateId = :candidateId', { candidateId });
    }

    if (stage) {
      qb.andWhere('app.stage = :stage', { stage });
    }

    if (status) {
      qb.andWhere('app.status = :status', { status });
    }

    if (minScore) {
      qb.andWhere('app.scoreTotal >= :minScore', { minScore: Number(minScore) });
    }

    if (search) {
      qb.andWhere(
        '(candidate.firstName ILIKE :search OR candidate.lastName ILIKE :search OR candidate.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    qb.orderBy('app.createdAt', 'DESC')
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
   * Get single application with full details
   * GET /api/v1/recruitment/applications/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return await this.applicationRepo.findOne({
      where: {
        id,
        organizationId: req.user.organizationId,
      },
      relations: ['candidate', 'jobPosting'],
    });
  }

  /**
   * Get application pipeline (Kanban view)
   * GET /api/v1/recruitment/applications/pipeline/:requisitionId
   */
  @Get('pipeline/:requisitionId')
  async getPipeline(@Param('requisitionId') requisitionId: string, @Req() req: any) {
    const applications = await this.applicationRepo
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.candidate', 'candidate')
      .leftJoinAndSelect('app.jobPosting', 'jobPosting')
      .where('app.organizationId = :organizationId', {
        organizationId: req.user.organizationId,
      })
      .andWhere('jobPosting.requisitionId = :requisitionId', { requisitionId })
      .andWhere('app.status = :status', { status: ApplicationStatus.ACTIVE })
      .orderBy('app.scoreTotal', 'DESC')
      .getMany();

    // Group by stage
    const pipeline: Record<ApplicationStage, Application[]> = {} as any;
    Object.values(ApplicationStage).forEach(stage => {
      pipeline[stage] = [];
    });

    applications.forEach(app => {
      pipeline[app.stage].push(app);
    });

    return pipeline;
  }

  /**
   * Move application to different stage
   * POST /api/v1/recruitment/applications/:id/move
   */
  @Post(':id/move')
  async moveStage(
    @Param('id') id: string,
    @Body() dto: { toStage: ApplicationStage; comment?: string; reasonCategory?: string },
    @Req() req: any,
  ) {
    const application = await this.workflowService.moveStage({
      applicationId: id,
      toStage: dto.toStage,
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      comment: dto.comment,
      reasonCategory: dto.reasonCategory,
      organizationId: req.user.organizationId,
    });

    // Notify watchers
    await this.notificationService.notifyStageChange({
      applicationId: id,
      candidateId: application.candidateId,
      candidateName: 'Candidate Name', // TODO: Get from application
      jobTitle: 'Job Title',
      fromStage: application.stage.toString(),
      toStage: dto.toStage,
      actorId: req.user.id,
      actorName: req.user.name,
      organizationId: req.user.organizationId,
    });

    return application;
  }

  /**
   * Reject application
   * POST /api/v1/recruitment/applications/:id/reject
   */
  @Post(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body() dto: { reason: string; feedback?: string },
    @Req() req: any,
  ) {
    return await this.workflowService.reject({
      applicationId: id,
      reason: dto.reason,
      feedback: dto.feedback,
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      organizationId: req.user.organizationId,
    });
  }

  /**
   * Bulk move applications
   * POST /api/v1/recruitment/applications/bulk/move
   */
  @Post('bulk/move')
  async bulkMove(
    @Body() dto: { applicationIds: string[]; toStage: ApplicationStage; comment?: string },
    @Req() req: any,
  ) {
    return await this.workflowService.bulkMoveStage({
      applicationIds: dto.applicationIds,
      toStage: dto.toStage,
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      comment: dto.comment,
      organizationId: req.user.organizationId,
    });
  }

  /**
   * Bulk reject applications
   * POST /api/v1/recruitment/applications/bulk/reject
   */
  @Post('bulk/reject')
  async bulkReject(
    @Body() dto: { applicationIds: string[]; reason: string; feedback?: string },
    @Req() req: any,
  ) {
    const results = { success: [], failed: [] };

    for (const id of dto.applicationIds) {
      try {
        await this.workflowService.reject({
          applicationId: id,
          reason: dto.reason,
          feedback: dto.feedback,
          actorId: req.user.id,
          actorName: req.user.name,
          actorRole: req.user.role,
          organizationId: req.user.organizationId,
        });
        results.success.push(id);
      } catch (error) {
        results.failed.push({ id, error: error.message });
      }
    }

    return results;
  }

  /**
   * Score application with AI
   * POST /api/v1/recruitment/applications/:id/score
   */
  @Post(':id/score')
  async scoreApplication(@Param('id') id: string) {
    return await this.aiScoringService.scoreApplication(id);
  }

  /**
   * Batch score applications
   * POST /api/v1/recruitment/applications/bulk/score
   */
  @Post('bulk/score')
  async bulkScore(@Body('applicationIds') applicationIds: string[]) {
    const results = await this.aiScoringService.batchScoreApplications(applicationIds);
    return Object.fromEntries(results);
  }

  /**
   * Add flag to application
   * POST /api/v1/recruitment/applications/:id/flags
   */
  @Post(':id/flags')
  async addFlag(
    @Param('id') id: string,
    @Body() dto: { type: 'RED' | 'AMBER' | 'GREEN'; reason: string },
    @Req() req: any,
  ) {
    const application = await this.applicationRepo.findOne({
      where: { id, organizationId: req.user.organizationId },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    application.flags.push({
      type: dto.type,
      reason: dto.reason,
      raisedBy: req.user.id,
      raisedAt: new Date(),
    });

    return await this.applicationRepo.save(application);
  }

  /**
   * Remove flag from application
   * DELETE /api/v1/recruitment/applications/:id/flags/:flagIndex
   */
  @Delete(':id/flags/:flagIndex')
  async removeFlag(
    @Param('id') id: string,
    @Param('flagIndex') flagIndex: number,
    @Req() req: any,
  ) {
    const application = await this.applicationRepo.findOne({
      where: { id, organizationId: req.user.organizationId },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    application.flags.splice(Number(flagIndex), 1);
    return await this.applicationRepo.save(application);
  }

  /**
   * Add tag to application
   * POST /api/v1/recruitment/applications/:id/tags
   */
  @Post(':id/tags')
  async addTag(
    @Param('id') id: string,
    @Body('tag') tag: string,
    @Req() req: any,
  ) {
    const application = await this.applicationRepo.findOne({
      where: { id, organizationId: req.user.organizationId },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    if (!application.tags.includes(tag)) {
      application.tags.push(tag);
    }

    return await this.applicationRepo.save(application);
  }

  /**
   * Remove tag from application
   * DELETE /api/v1/recruitment/applications/:id/tags/:tag
   */
  @Delete(':id/tags/:tag')
  async removeTag(
    @Param('id') id: string,
    @Param('tag') tag: string,
    @Req() req: any,
  ) {
    const application = await this.applicationRepo.findOne({
      where: { id, organizationId: req.user.organizationId },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    application.tags = application.tags.filter(t => t !== tag);
    return await this.applicationRepo.save(application);
  }

  /**
   * Get available transitions for application
   * GET /api/v1/recruitment/applications/:id/transitions
   */
  @Get(':id/transitions')
  async getAvailableTransitions(@Param('id') id: string, @Req() req: any) {
    const application = await this.applicationRepo.findOne({
      where: { id, organizationId: req.user.organizationId },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    const transitions = this.workflowService.getAvailableTransitions(
      application.stage,
      req.user.role
    );

    return { currentStage: application.stage, availableTransitions: transitions };
  }

  /**
   * Get application statistics
   * GET /api/v1/recruitment/applications/stats/summary
   */
  @Get('stats/summary')
  async getStats(@Query('requisitionId') requisitionId: string, @Req() req: any) {
    const where: any = { organizationId: req.user.organizationId };

    const qb = this.applicationRepo.createQueryBuilder('app');

    if (requisitionId) {
      qb.leftJoin('app.jobPosting', 'jobPosting')
        .where('jobPosting.requisitionId = :requisitionId', { requisitionId })
        .andWhere('app.organizationId = :organizationId', {
          organizationId: req.user.organizationId,
        });
    } else {
      qb.where('app.organizationId = :organizationId', {
        organizationId: req.user.organizationId,
      });
    }

    const applications = await qb.getMany();

    const stats = {
      total: applications.length,
      active: applications.filter(a => a.status === ApplicationStatus.ACTIVE).length,
      rejected: applications.filter(a => a.status === ApplicationStatus.REJECTED).length,
      hired: applications.filter(a => a.status === ApplicationStatus.OFFER_ACCEPTED).length,
      byStage: {} as Record<ApplicationStage, number>,
      avgScore: 0,
      withRedFlags: 0,
    };

    // By stage
    Object.values(ApplicationStage).forEach(stage => {
      stats.byStage[stage] = applications.filter(a => a.stage === stage).length;
    });

    // Avg score
    const scored = applications.filter(a => a.scoreTotal);
    if (scored.length > 0) {
      stats.avgScore = scored.reduce((sum, a) => sum + (a.scoreTotal || 0), 0) / scored.length;
    }

    // Red flags
    stats.withRedFlags = applications.filter(a => a.hasRedFlags()).length;

    return stats;
  }
}
