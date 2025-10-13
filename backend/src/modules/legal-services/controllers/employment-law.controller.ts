import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { EmploymentLawService } from '../services/employment-law.service';
import {
  CreateEqualityCaseDto,
  UpdateEqualityCaseDto,
  CreateWorkingTimeComplianceDto,
  CreateRedundancyProcessDto,
  UpdateRedundancyProcessDto,
  AddSelectionPoolDto,
  SetSelectionCriteriaDto,
  ScoreEmployeeDto,
  OfferAlternativeRoleDto,
  CalculateRedundancyPayDto,
  CreateWhistleblowingCaseDto,
  UpdateWhistleblowingCaseDto,
  CreateEmploymentContractDto,
  UpdateEmploymentContractDto,
  CheckMinimumWageDto,
  CreateFamilyLeaveDto,
  UpdateFamilyLeaveDto,
  CreateGDPRDataRequestDto,
  CreateGDPRDataBreachDto,
  CreateAgencyWorkerDto,
  UpdateAgencyWorkerDto,
} from '../dto/employment-law.dto';

@Controller('employment-law')
export class EmploymentLawController {
  constructor(private readonly service: EmploymentLawService) {}

  // ========== EQUALITY & DISCRIMINATION ==========
  @Post('equality-cases')
  async createEqualityCase(@Body() dto: CreateEqualityCaseDto) {
    return this.service.createEqualityCase(dto);
  }

  @Get('equality-cases')
  async getAllEqualityCases(@Query('organizationId') orgId: string) {
    return this.service.findAllEqualityCases(orgId);
  }

  @Get('equality-cases/:id')
  async getEqualityCase(@Param('id') id: string) {
    return this.service.getEqualityCase(id);
  }

  @Put('equality-cases/:id')
  async updateEqualityCase(
    @Param('id') id: string,
    @Body() dto: UpdateEqualityCaseDto,
    @Body('updatedBy') updatedBy: string,
  ) {
    return this.service.updateEqualityCase(id, dto, updatedBy);
  }

  @Post('equality-cases/:id/adjustments')
  async addReasonableAdjustments(@Param('id') id: string, @Body() adjustment: any) {
    return this.service.addReasonableAdjustments(id, adjustment);
  }

  // ========== WORKING TIME REGULATIONS ==========
  @Post('working-time-compliance')
  async createWorkingTimeCompliance(@Body() dto: CreateWorkingTimeComplianceDto) {
    return this.service.createWorkingTimeCompliance(dto);
  }

  @Get('working-time-compliance')
  async getWorkingTimeCompliance(
    @Query('organizationId') orgId: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.service.findWorkingTimeCompliance(orgId, employeeId);
  }

  @Get('working-time-compliance/violations')
  async getWorkingTimeViolations(@Query('organizationId') orgId: string) {
    return this.service.getWorkingTimeViolations(orgId);
  }

  // ========== REDUNDANCY PROCESS ==========
  @Post('redundancy-processes')
  async createRedundancyProcess(@Body() dto: CreateRedundancyProcessDto) {
    return this.service.createRedundancyProcess(dto);
  }

  @Get('redundancy-processes')
  async getAllRedundancyProcesses(@Query('organizationId') orgId: string) {
    return this.service.findAllRedundancyProcesses(orgId);
  }

  @Put('redundancy-processes/:id')
  async updateRedundancyProcess(
    @Param('id') id: string,
    @Body() dto: UpdateRedundancyProcessDto,
    @Body('updatedBy') updatedBy: string,
  ) {
    return this.service.updateRedundancyProcess(id, dto, updatedBy);
  }

  @Post('redundancy-processes/:id/selection-pool')
  async addSelectionPool(@Param('id') id: string, @Body() dto: AddSelectionPoolDto) {
    return this.service.addSelectionPool(id, dto);
  }

  @Post('redundancy-processes/:id/selection-criteria')
  async setSelectionCriteria(@Param('id') id: string, @Body() dto: SetSelectionCriteriaDto) {
    return this.service.setSelectionCriteria(id, dto);
  }

  @Post('redundancy-processes/:id/score-employee')
  async scoreEmployee(@Param('id') id: string, @Body() dto: ScoreEmployeeDto) {
    return this.service.scoreEmployee(id, dto);
  }

  @Post('redundancy-processes/:id/alternative-role')
  async offerAlternativeRole(@Param('id') id: string, @Body() dto: OfferAlternativeRoleDto) {
    return this.service.offerAlternativeRole(id, dto);
  }

  @Post('redundancy-processes/:id/calculate-pay')
  async calculateRedundancyPay(@Param('id') id: string, @Body() dto: CalculateRedundancyPayDto) {
    return this.service.calculateRedundancyPay(id, dto);
  }

  // ========== WHISTLEBLOWING ==========
  @Post('whistleblowing-cases')
  async createWhistleblowingCase(@Body() dto: CreateWhistleblowingCaseDto) {
    return this.service.createWhistleblowingCase(dto);
  }

  @Get('whistleblowing-cases')
  async getAllWhistleblowingCases(@Query('organizationId') orgId: string) {
    return this.service.findAllWhistleblowingCases(orgId);
  }

  @Put('whistleblowing-cases/:id')
  async updateWhistleblowingCase(
    @Param('id') id: string,
    @Body() dto: UpdateWhistleblowingCaseDto,
    @Body('updatedBy') updatedBy: string,
  ) {
    return this.service.updateWhistleblowingCase(id, dto, updatedBy);
  }

  // ========== EMPLOYMENT CONTRACTS ==========
  @Post('contracts')
  async createEmploymentContract(@Body() dto: CreateEmploymentContractDto) {
    return this.service.createEmploymentContract(dto);
  }

  @Get('contracts')
  async getAllContracts(
    @Query('organizationId') orgId: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.service.findAllContracts(orgId, employeeId);
  }

  @Get('contracts/:id')
  async getContract(@Param('id') id: string) {
    return this.service.getContract(id);
  }

  @Put('contracts/:id')
  async updateEmploymentContract(
    @Param('id') id: string,
    @Body() dto: UpdateEmploymentContractDto,
    @Body('updatedBy') updatedBy: string,
  ) {
    return this.service.updateEmploymentContract(id, dto, updatedBy);
  }

  // ========== MINIMUM WAGE COMPLIANCE ==========
  @Post('minimum-wage-compliance')
  async checkMinimumWage(@Body() dto: CheckMinimumWageDto) {
    return this.service.checkMinimumWage(dto);
  }

  @Get('minimum-wage-compliance')
  async getMinimumWageCompliance(
    @Query('organizationId') orgId: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.service.findMinimumWageCompliance(orgId, employeeId);
  }

  @Get('minimum-wage-compliance/violations')
  async getMinimumWageViolations(@Query('organizationId') orgId: string) {
    return this.service.getMinimumWageViolations(orgId);
  }

  // ========== FAMILY LEAVE ==========
  @Post('family-leave')
  async createFamilyLeave(@Body() dto: CreateFamilyLeaveDto) {
    return this.service.createFamilyLeave(dto);
  }

  @Get('family-leave')
  async getAllFamilyLeave(
    @Query('organizationId') orgId: string,
    @Query('employeeId') employeeId?: string,
  ) {
    return this.service.findAllFamilyLeave(orgId, employeeId);
  }

  @Put('family-leave/:id')
  async updateFamilyLeave(@Param('id') id: string, @Body() dto: UpdateFamilyLeaveDto) {
    return this.service.updateFamilyLeave(id, dto);
  }

  // ========== GDPR COMPLIANCE ==========
  @Post('gdpr/data-requests')
  async createGDPRDataRequest(@Body() dto: CreateGDPRDataRequestDto) {
    return this.service.createGDPRDataRequest(dto);
  }

  @Get('gdpr/data-requests')
  async getAllGDPRDataRequests(@Query('organizationId') orgId: string) {
    return this.service.findAllGDPRDataRequests(orgId);
  }

  @Put('gdpr/data-requests/:id')
  async updateGDPRDataRequest(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('responseDetails') responseDetails?: string,
    @Body('completedBy') completedBy?: string,
  ) {
    return this.service.updateGDPRDataRequest(id, status, responseDetails, completedBy);
  }

  @Post('gdpr/data-breaches')
  async createGDPRDataBreach(@Body() dto: CreateGDPRDataBreachDto) {
    return this.service.createGDPRDataBreach(dto);
  }

  @Get('gdpr/data-breaches')
  async getAllGDPRDataBreaches(@Query('organizationId') orgId: string) {
    return this.service.findAllGDPRDataBreaches(orgId);
  }

  // ========== AGENCY WORKERS ==========
  @Post('agency-workers')
  async createAgencyWorker(@Body() dto: CreateAgencyWorkerDto) {
    return this.service.createAgencyWorker(dto);
  }

  @Get('agency-workers')
  async getAllAgencyWorkers(@Query('organizationId') orgId: string) {
    return this.service.findAllAgencyWorkers(orgId);
  }

  @Put('agency-workers/:id')
  async updateAgencyWorker(@Param('id') id: string, @Body() dto: UpdateAgencyWorkerDto) {
    return this.service.updateAgencyWorker(id, dto);
  }

  @Get('agency-workers/compliance-check')
  async checkAgencyWorkerCompliance(@Query('organizationId') orgId: string) {
    return this.service.checkAgencyWorkerCompliance(orgId);
  }

  // ========== DASHBOARD & ANALYTICS ==========
  @Get('dashboard')
  async getEmploymentLawDashboard(@Query('organizationId') orgId: string) {
    return this.service.getEmploymentLawDashboard(orgId);
  }
}
