import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { HealthSafetyService } from './health-safety.service';
import { CreateRiskAssessmentDto, CreateIncidentDto } from './dto/create-risk-assessment.dto';

@Controller('health-safety')
export class HealthSafetyController {
  constructor(private readonly service: HealthSafetyService) {}

  // === RISK ASSESSMENTS ===
  @Post('risk-assessments')
  async createRiskAssessment(@Body() dto: CreateRiskAssessmentDto, @Request() req) {
    return this.service.createRiskAssessment(dto, req.user?.id || 'system');
  }

  @Get('risk-assessments')
  async getAllRiskAssessments(@Query('organizationId') orgId: string) {
    return this.service.findAllRiskAssessments(orgId);
  }

  @Put('risk-assessments/:id/approve')
  async approveRiskAssessment(@Param('id') id: string, @Request() req) {
    return this.service.approveRiskAssessment(id, req.user?.id || 'system');
  }

  // === INCIDENTS ===
  @Post('incidents')
  async createIncident(@Body() dto: CreateIncidentDto, @Request() req) {
    return this.service.createIncident(dto, req.user?.id || 'system');
  }

  @Get('incidents')
  async getAllIncidents(
    @Query('organizationId') orgId: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAllIncidents(orgId, { type, status });
  }

  @Put('incidents/:id/status')
  async updateIncidentStatus(
    @Param('id') id: string,
    @Body('status') status: any,
    @Request() req,
  ) {
    return this.service.updateIncidentStatus(id, status, req.user?.id);
  }

  // === HAZARDOUS SUBSTANCES ===
  @Post('substances')
  async createSubstance(@Body() data: any) {
    return this.service.createSubstance(data);
  }

  @Get('substances')
  async getAllSubstances(@Query('organizationId') orgId: string) {
    return this.service.findAllSubstances(orgId);
  }

  // === METHOD STATEMENTS ===
  @Post('method-statements')
  async createMethodStatement(@Body() data: any) {
    return this.service.createMethodStatement(data);
  }

  @Get('method-statements')
  async getAllMethodStatements(@Query('organizationId') orgId: string) {
    return this.service.findAllMethodStatements(orgId);
  }

  // === RESPONSIBILITIES ===
  @Post('responsibilities')
  async assignResponsibility(@Body() data: any) {
    return this.service.assignResponsibility(data);
  }

  @Get('responsibilities/user/:userId')
  async getUserResponsibilities(@Param('userId') userId: string) {
    return this.service.findResponsibilities(userId);
  }

  // === ANALYTICS ===
  @Get('analytics')
  async getAnalytics(
    @Query('organizationId') orgId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.service.getAnalytics(orgId, new Date(startDate), new Date(endDate));
  }
}
