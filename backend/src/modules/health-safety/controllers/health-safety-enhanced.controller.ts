import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { HealthSafetyEnhancedService } from '../services/health-safety-enhanced.service';
import {
  CreateHealthSafetyPolicyDto,
  UpdateHealthSafetyPolicyDto,
  CreateTrainingRecordDto,
  UpdateTrainingRecordDto,
  CreateDSEAssessmentDto,
  UpdateDSEAssessmentDto,
  CreateManualHandlingAssessmentDto,
  UpdateManualHandlingAssessmentDto,
  CreateFireRiskAssessmentDto,
  UpdateFireRiskAssessmentDto,
  CreateRIDDORReportDto,
  UpdateRIDDORReportDto,
  CreatePPEDto,
  IssuePPEDto,
  UpdatePPEDto,
  CreateWorkplaceInspectionDto,
  UpdateWorkplaceInspectionDto,
  CreateHSEEnforcementDto,
  UpdateHSEEnforcementDto,
} from '../dto/health-safety.dto';

@Controller('health-safety-enhanced')
export class HealthSafetyEnhancedController {
  constructor(private readonly service: HealthSafetyEnhancedService) {}

  // ========== HEALTH & SAFETY POLICY ==========
  @Post('policies')
  async createPolicy(@Body() dto: CreateHealthSafetyPolicyDto) {
    return this.service.createPolicy(dto);
  }

  @Get('policies')
  async getAllPolicies(@Query('organizationId') orgId: string) {
    return this.service.findAllPolicies(orgId);
  }

  @Get('policies/active')
  async getActivePolicy(@Query('organizationId') orgId: string) {
    return this.service.getActivePolicy(orgId);
  }

  @Put('policies/:id')
  async updatePolicy(@Param('id') id: string, @Body() dto: UpdateHealthSafetyPolicyDto) {
    return this.service.updatePolicy(id, dto);
  }

  // ========== TRAINING MANAGEMENT ==========
  @Post('training')
  async createTrainingRecord(@Body() dto: CreateTrainingRecordDto) {
    return this.service.createTrainingRecord(dto);
  }

  @Get('training')
  async getAllTraining(
    @Query('organizationId') orgId: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.service.findAllTraining(orgId, employeeId);
  }

  @Get('training/expiring')
  async getExpiringTraining(
    @Query('organizationId') orgId: string,
    @Query('days') days: number = 30,
  ) {
    return this.service.getExpiringTraining(orgId, days);
  }

  @Put('training/:id')
  async updateTraining(@Param('id') id: string, @Body() dto: UpdateTrainingRecordDto) {
    return this.service.updateTrainingRecord(id, dto);
  }

  // ========== DSE ASSESSMENTS ==========
  @Post('dse-assessments')
  async createDSEAssessment(@Body() dto: CreateDSEAssessmentDto) {
    return this.service.createDSEAssessment(dto);
  }

  @Get('dse-assessments')
  async getAllDSEAssessments(
    @Query('organizationId') orgId: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.service.findAllDSEAssessments(orgId, employeeId);
  }

  @Get('dse-assessments/due-review')
  async getDSEAssessmentsDueReview(@Query('organizationId') orgId: string) {
    return this.service.getDSEAssessmentsDueReview(orgId);
  }

  @Put('dse-assessments/:id')
  async updateDSEAssessment(@Param('id') id: string, @Body() dto: UpdateDSEAssessmentDto) {
    return this.service.updateTrainingRecord(id, dto as any);
  }

  // ========== MANUAL HANDLING ASSESSMENTS ==========
  @Post('manual-handling')
  async createManualHandlingAssessment(@Body() dto: CreateManualHandlingAssessmentDto) {
    return this.service.createManualHandlingAssessment(dto);
  }

  @Get('manual-handling')
  async getAllManualHandlingAssessments(@Query('organizationId') orgId: string) {
    return this.service.findAllManualHandlingAssessments(orgId);
  }

  @Put('manual-handling/:id')
  async updateManualHandlingAssessment(@Param('id') id: string, @Body() dto: UpdateManualHandlingAssessmentDto) {
    return this.service.updateTrainingRecord(id, dto as any);
  }

  // ========== FIRE RISK ASSESSMENTS ==========
  @Post('fire-risk-assessments')
  async createFireRiskAssessment(@Body() dto: CreateFireRiskAssessmentDto) {
    return this.service.createFireRiskAssessment(dto);
  }

  @Get('fire-risk-assessments')
  async getAllFireRiskAssessments(@Query('organizationId') orgId: string) {
    return this.service.findAllFireRiskAssessments(orgId);
  }

  @Put('fire-risk-assessments/:id')
  async updateFireRiskAssessment(@Param('id') id: string, @Body() dto: UpdateFireRiskAssessmentDto) {
    return this.service.updatePolicy(id, dto as any);
  }

  // ========== RIDDOR REPORTING ==========
  @Post('riddor')
  async createRIDDORReport(@Body() dto: CreateRIDDORReportDto) {
    return this.service.createRIDDORReport(dto);
  }

  @Get('riddor')
  async getAllRIDDORReports(@Query('organizationId') orgId: string) {
    return this.service.findAllRIDDORReports(orgId);
  }

  @Put('riddor/:id')
  async updateRIDDORReport(@Param('id') id: string, @Body() dto: UpdateRIDDORReportDto) {
    return this.service.updateRIDDORReport(id, dto);
  }

  // ========== PPE MANAGEMENT ==========
  @Post('ppe')
  async createPPE(@Body() dto: CreatePPEDto) {
    return this.service.createPPE(dto);
  }

  @Post('ppe/:id/issue')
  async issuePPE(@Param('id') id: string, @Body() dto: IssuePPEDto) {
    return this.service.issuePPE(id, dto);
  }

  @Get('ppe')
  async getAllPPE(@Query('organizationId') orgId: string) {
    return this.service.findAllPPE(orgId);
  }

  @Get('ppe/low-stock')
  async getLowStockPPE(@Query('organizationId') orgId: string) {
    return this.service.getLowStockPPE(orgId);
  }

  @Put('ppe/:id')
  async updatePPE(@Param('id') id: string, @Body() dto: UpdatePPEDto) {
    return this.service.updatePolicy(id, dto as any);
  }

  // ========== WORKPLACE INSPECTIONS ==========
  @Post('inspections')
  async createInspection(@Body() dto: CreateWorkplaceInspectionDto) {
    return this.service.createInspection(dto);
  }

  @Get('inspections')
  async getAllInspections(@Query('organizationId') orgId: string) {
    return this.service.findAllInspections(orgId);
  }

  @Put('inspections/:id')
  async updateInspection(@Param('id') id: string, @Body() dto: UpdateWorkplaceInspectionDto) {
    return this.service.updatePolicy(id, dto as any);
  }

  // ========== HSE ENFORCEMENT ==========
  @Post('enforcement')
  async createEnforcementNotice(@Body() dto: CreateHSEEnforcementDto) {
    return this.service.createEnforcementNotice(dto);
  }

  @Get('enforcement')
  async getAllEnforcementNotices(@Query('organizationId') orgId: string) {
    return this.service.findAllEnforcementNotices(orgId);
  }

  @Put('enforcement/:id')
  async updateEnforcementNotice(@Param('id') id: string, @Body() dto: UpdateHSEEnforcementDto) {
    return this.service.updateEnforcementNotice(id, dto);
  }

  // ========== COMPLIANCE DASHBOARD ==========
  @Get('dashboard')
  async getComplianceDashboard(@Query('organizationId') orgId: string) {
    return this.service.getComplianceDashboard(orgId);
  }
}
