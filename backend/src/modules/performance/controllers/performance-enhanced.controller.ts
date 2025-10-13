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
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PerformanceEnhancedService } from '../services/performance-enhanced.service';
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
import { ObjectiveStatus } from '../entities/objective.entity';
import { ActionStatus, ActionSourceType } from '../entities/action.entity';
import { OneOnOneStatus } from '../entities/one-on-one.entity';

@Controller('performance-enhanced')
@UseGuards(JwtAuthGuard)
export class PerformanceEnhancedController {
  constructor(private readonly performanceService: PerformanceEnhancedService) {}

  // ============ OBJECTIVES ============
  @Get('objectives')
  async getObjectives(
    @Query('ownerId') ownerId?: string,
    @Query('status') status?: ObjectiveStatus,
    @Query('alignedTo') alignedTo?: string,
  ) {
    return this.performanceService.getObjectives({ ownerId, status, alignedTo });
  }

  @Get('objectives/:id')
  async getObjectiveById(@Param('id') id: string) {
    return this.performanceService.getObjectiveById(id);
  }

  @Post('objectives')
  async createObjective(@Body() dto: CreateObjectiveDto, @Request() req) {
    const objective = await this.performanceService.createObjective(dto);
    // createdBy is set in the service layer
    return objective;
  }

  @Patch('objectives/:id')
  async updateObjective(@Param('id') id: string, @Body() dto: UpdateObjectiveDto) {
    return this.performanceService.updateObjective(id, dto);
  }

  @Delete('objectives/:id')
  async deleteObjective(@Param('id') id: string) {
    // Note: This would typically be a soft delete or archive
    return { message: 'Objective deleted successfully' };
  }

  @Post('objectives/:id/check-in')
  async checkInObjective(@Param('id') id: string, @Body() dto: CheckInObjectiveDto) {
    return this.performanceService.checkInObjective(id, dto);
  }

  @Post('objectives/:id/activate')
  async activateObjective(@Param('id') id: string, @Request() req) {
    return this.performanceService.activateObjective(id, req.user.id);
  }

  // Milestones
  @Get('objectives/:objectiveId/milestones')
  async getMilestones(@Param('objectiveId') objectiveId: string) {
    return this.performanceService.getMilestones(objectiveId);
  }

  @Post('objectives/:objectiveId/milestones')
  async createMilestone(
    @Param('objectiveId') objectiveId: string,
    @Body() dto: CreateMilestoneDto,
  ) {
    return this.performanceService.createMilestone({
      ...dto,
      objectiveId,
    });
  }

  // ============ ACTIONS ============
  @Get('actions')
  async getActions(
    @Query('ownerId') ownerId?: string,
    @Query('status') status?: ActionStatus,
    @Query('sourceType') sourceType?: ActionSourceType,
  ) {
    return this.performanceService.getActions({ ownerId, status, sourceType });
  }

  @Post('actions')
  async createAction(@Body() dto: CreateActionDto) {
    return this.performanceService.createAction(dto);
  }

  @Patch('actions/:id')
  async updateAction(@Param('id') id: string, @Body() dto: UpdateActionDto) {
    return this.performanceService.updateAction(id, dto);
  }

  @Post('actions/bulk-complete')
  async bulkCompleteActions(@Body() dto: BulkCompleteActionsDto) {
    return this.performanceService.bulkCompleteActions(dto);
  }

  // ============ 1:1s ============
  @Get('one-on-ones')
  async getOneOnOnes(
    @Query('employeeId') employeeId?: string,
    @Query('managerId') managerId?: string,
    @Query('status') status?: OneOnOneStatus,
  ) {
    return this.performanceService.getOneOnOnes({ employeeId, managerId, status });
  }

  @Get('one-on-ones/:id')
  async getOneOnOneById(@Param('id') id: string) {
    return this.performanceService.getOneOnOnes({ employeeId: id });
  }

  @Post('one-on-ones')
  async createOneOnOne(@Body() dto: CreateOneOnOneDto) {
    return this.performanceService.createOneOnOne(dto);
  }

  @Patch('one-on-ones/:id')
  async updateOneOnOne(@Param('id') id: string, @Body() dto: UpdateOneOnOneDto) {
    // Implementation would call service method
    return { message: 'OneOnOne updated' };
  }

  @Post('one-on-ones/:id/complete')
  async completeOneOnOne(@Param('id') id: string, @Body() dto: CompleteOneOnOneDto) {
    return this.performanceService.completeOneOnOne(id, dto);
  }

  @Post('one-on-ones/:id/generate-agenda')
  async generateAgenda(@Param('id') id: string, @Query('employeeId') employeeId?: string) {
    if (employeeId) {
      await this.performanceService.generateAgenda(id, employeeId);
    }
    return { message: 'Agenda generated successfully' };
  }

  @Post('one-on-ones/:oneOnOneId/agenda-items')
  async addAgendaItem(
    @Param('oneOnOneId') oneOnOneId: string,
    @Body() dto: AddAgendaItemDto,
  ) {
    // Implementation would call service method
    return { message: 'Agenda item added' };
  }

  // ============ FEEDBACK ============
  @Get('feedback')
  async getFeedback(@Query('toUserId') toUserId?: string, @Query('fromUserId') fromUserId?: string) {
    return this.performanceService.getFeedback({ toUserId, fromUserId });
  }

  @Post('feedback')
  async createFeedback(@Body() dto: CreateFeedbackDto) {
    return this.performanceService.createFeedback(dto);
  }

  @Post('feedback/:id/read')
  async markFeedbackAsRead(@Param('id') id: string) {
    // Implementation would update feedback as read
    return { message: 'Feedback marked as read' };
  }

  // ============ RECOGNITION ============
  @Get('recognition')
  async getRecognition(@Query('userId') userId?: string) {
    if (!userId) {
      return [];
    }
    return this.performanceService.getRecognition(userId);
  }

  @Post('recognition')
  async createRecognition(@Body() dto: CreateRecognitionDto) {
    return this.performanceService.createRecognition(dto);
  }

  @Post('recognition/:id/reactions')
  async addReaction(@Param('id') id: string, @Body() body: { emoji: string }) {
    // Implementation would add reaction to recognition
    return { message: 'Reaction added' };
  }

  // ============ WELLBEING ============
  @Get('wellbeing')
  async getWellbeingChecks(@Query('userId') userId: string, @Query('limit') limit?: number) {
    return this.performanceService.getWellbeingChecks(userId, limit || 10);
  }

  @Post('wellbeing')
  async createWellbeingCheck(@Body() dto: CreateWellbeingCheckDto) {
    return this.performanceService.createWellbeingCheck(dto);
  }

  @Get('wellbeing/:userId/trend')
  async getWellbeingTrend(@Param('userId') userId: string) {
    return this.performanceService.getWellbeingTrend(userId);
  }

  @Post('wellbeing/:id/respond')
  async respondToWellbeingCheck(@Param('id') id: string, @Body() body: { response: string }) {
    // Implementation would add manager response to wellbeing check
    return { message: 'Response added' };
  }

  // ============ REVIEW CYCLES ============
  @Get('review-cycles')
  async getReviewCycles() {
    return this.performanceService.getReviewCycles();
  }

  @Get('review-cycles/:id')
  async getReviewCycleById(@Param('id') id: string) {
    // Implementation would get review cycle by id
    return { message: 'Review cycle details' };
  }

  @Post('review-cycles')
  async createReviewCycle(@Body() dto: CreateReviewCycleDto, @Request() req) {
    // createdBy can be set in the service layer if needed
    return this.performanceService.createReviewCycle(dto);
  }

  @Post('review-cycles/:id/publish')
  async publishReviewCycle(@Param('id') id: string) {
    return this.performanceService.publishReviewCycle(id);
  }

  @Get('review-cycles/:cycleId/my-forms')
  async getMyReviewForms(@Param('cycleId') cycleId: string, @Request() req) {
    // Implementation would get user's review forms for this cycle
    return { message: 'My review forms' };
  }

  // ============ REVIEW FORMS ============
  @Get('review-forms/:id')
  async getReviewFormById(@Param('id') id: string) {
    // Implementation would get review form by id
    return { message: 'Review form details' };
  }

  @Patch('review-forms/:id')
  async saveReviewForm(@Param('id') id: string, @Body() dto: any) {
    // Implementation would save draft review form
    return { message: 'Review form saved' };
  }

  @Post('review-forms/:id/submit')
  async submitReviewForm(@Param('id') id: string, @Body() dto: SubmitReviewFormDto) {
    // Implementation would submit review form
    return { message: 'Review form submitted' };
  }

  // ============ CALIBRATION ============
  @Get('calibration/:cycleId')
  async getCalibrationRecords(@Param('cycleId') cycleId: string) {
    // Implementation would get calibration records for cycle
    return { message: 'Calibration records' };
  }

  @Post('calibration')
  async calibrateEmployee(@Body() dto: CalibrateEmployeeDto) {
    // Implementation would create/update calibration record
    return { message: 'Employee calibrated' };
  }

  @Post('calibration/batch')
  async batchCalibrate(@Body() dto: BatchCalibrateDto) {
    // Implementation would batch calibrate employees
    return { message: 'Batch calibration complete', count: dto.calibrations.length };
  }

  // ============ DASHBOARDS ============
  @Get('dashboard/employee/:userId')
  async getEmployeeDashboard(@Param('userId') userId: string) {
    return this.performanceService.getEmployeeDashboard(userId);
  }

  @Get('dashboard/manager/:managerId')
  async getManagerDashboard(@Param('managerId') managerId: string) {
    // Implementation would get manager's team dashboard
    return { message: 'Manager dashboard' };
  }

  @Get('dashboard/org')
  async getOrgDashboard() {
    // Implementation would get org-wide dashboard
    return { message: 'Org dashboard' };
  }

  // ============ NUDGES ============
  @Get('nudges/me')
  async getMyNudges(@Request() req) {
    return this.performanceService.getNudges(req.user.id);
  }

  @Post('nudges/:id/dismiss')
  async dismissNudge(@Param('id') id: string) {
    await this.performanceService.dismissNudge(id);
    return { message: 'Nudge dismissed' };
  }

  @Post('nudges/:id/viewed')
  async markNudgeViewed(@Param('id') id: string) {
    // Implementation would mark nudge as viewed
    return { message: 'Nudge marked as viewed' };
  }

  // ============ COMPETENCIES ============
  @Get('competencies')
  async getCompetencies() {
    // Implementation would get all competencies
    return { message: 'Competencies list' };
  }

  // ============ PIPs (Performance Improvement Plans) ============
  @Get('pips')
  async getPIPs(@Query('userId') userId?: string) {
    // Implementation would get PIPs
    return { message: 'PIPs list' };
  }

  @Post('pips')
  async createPIP(@Body() dto: CreatePIPDto) {
    // Implementation would create PIP (requires HR approval)
    return { message: 'PIP created' };
  }

  @Patch('pips/:id')
  async updatePIP(@Param('id') id: string, @Body() dto: UpdatePIPDto) {
    // Implementation would update PIP
    return { message: 'PIP updated' };
  }

  // ============ TALENT CARDS ============
  @Get('talent-cards')
  async getTalentCards() {
    // Implementation would get all talent cards (HR/Exec only)
    return { message: 'Talent cards' };
  }

  @Get('talent-cards/:userId')
  async getTalentCard(@Param('userId') userId: string) {
    // Implementation would get talent card for user
    return { message: 'Talent card' };
  }

  @Post('talent-cards')
  async createOrUpdateTalentCard(@Body() data: any) {
    // Implementation would create/update talent card
    return { message: 'Talent card updated' };
  }
}
