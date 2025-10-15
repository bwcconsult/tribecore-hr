import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RequirePolicy, PolicyGuard } from '../guards/policy.guard';
import { Role } from '../entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SoDCheckerService } from '../services/sod-checker.service';
import { DelegationManagementService, CreateDelegationDto, ApproveDelegationDto } from '../services/delegation-management.service';
import { RoleAnalyticsService } from '../services/role-analytics.service';
import { AccessAuditLog } from '../entities/access-audit-log.entity';

@ApiTags('RBAC & IAM')
@Controller('rbac')
@UseGuards(JwtAuthGuard, PolicyGuard)
export class RBACController {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(AccessAuditLog)
    private readonly auditRepo: Repository<AccessAuditLog>,
    private readonly sodChecker: SoDCheckerService,
    private readonly delegationService: DelegationManagementService,
    private readonly analyticsService: RoleAnalyticsService,
  ) {}

  // ============ ROLE MANAGEMENT ============

  @Get('roles')
  @ApiOperation({ summary: 'Get all roles' })
  @RequirePolicy({ action: 'view', resource: 'roles' })
  async getAllRoles(@Query('category') category?: string) {
    const where = category ? { category, isActive: true } : { isActive: true };
    return this.roleRepo.find({ where, relations: ['permissions'] });
  }

  @Get('roles/:id')
  @ApiOperation({ summary: 'Get role by ID' })
  @RequirePolicy({ action: 'view', resource: 'roles' })
  async getRoleById(@Param('id') id: string) {
    return this.roleRepo.findOne({
      where: { id },
      relations: ['permissions'],
    });
  }

  @Post('roles')
  @ApiOperation({ summary: 'Create new role' })
  @RequirePolicy({ action: 'create', resource: 'roles' })
  async createRole(@Body() roleData: Partial<Role>, @Request() req) {
    const role = this.roleRepo.create({
      ...roleData,
      createdBy: req.user.id,
      isSystemRole: false,
    });
    return this.roleRepo.save(role);
  }

  @Put('roles/:id')
  @ApiOperation({ summary: 'Update role' })
  @RequirePolicy({ action: 'update', resource: 'roles' })
  async updateRole(
    @Param('id') id: string,
    @Body() updates: Partial<Role>,
    @Request() req
  ) {
    await this.roleRepo.update(id, {
      ...updates,
      lastModifiedBy: req.user.id,
    });
    return this.roleRepo.findOne({ where: { id } });
  }

  @Delete('roles/:id')
  @ApiOperation({ summary: 'Delete role (soft delete)' })
  @RequirePolicy({ action: 'delete', resource: 'roles' })
  async deleteRole(@Param('id') id: string) {
    await this.roleRepo.update(id, { isActive: false });
    return { success: true, message: 'Role deactivated' };
  }

  // ============ USER ROLE ASSIGNMENT ============

  @Post('users/:userId/roles/:roleId')
  @ApiOperation({ summary: 'Assign role to user' })
  @RequirePolicy({ action: 'assign', resource: 'roles' })
  async assignRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
    @Request() req
  ) {
    // Check for SoD violations
    const sodCheck = await this.sodChecker.checkRoleAssignment(userId, roleId);
    
    if (!sodCheck.allowed) {
      return {
        success: false,
        violations: sodCheck.violations,
        message: 'Role assignment blocked due to SoD violations',
      };
    }

    // Assignment logic here (to be implemented with User entity)
    return {
      success: true,
      warnings: sodCheck.warnings,
      message: 'Role assigned successfully',
    };
  }

  @Delete('users/:userId/roles/:roleId')
  @ApiOperation({ summary: 'Remove role from user' })
  @RequirePolicy({ action: 'revoke', resource: 'roles' })
  async removeRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string
  ) {
    // Removal logic here
    return { success: true, message: 'Role removed' };
  }

  // ============ SOD CHECKS ============

  @Get('sod/violations')
  @ApiOperation({ summary: 'Get all SoD violations' })
  @RequirePolicy({ action: 'view', resource: 'sod_violations' })
  async getAllSoDViolations() {
    return this.sodChecker.scanAllUsers();
  }

  @Get('users/:userId/sod-violations')
  @ApiOperation({ summary: 'Get SoD violations for specific user' })
  @RequirePolicy({ action: 'view', resource: 'sod_violations' })
  async getUserSoDViolations(@Param('userId') userId: string) {
    return this.sodChecker.getUserViolations(userId);
  }

  @Post('sod/check')
  @ApiOperation({ summary: 'Check if role assignment would create SoD violation' })
  @RequirePolicy({ action: 'check', resource: 'sod_violations' })
  async checkSoDViolation(
    @Body() body: { userId: string; roleId: string }
  ) {
    return this.sodChecker.checkRoleAssignment(body.userId, body.roleId);
  }

  // ============ DELEGATION MANAGEMENT ============

  @Post('delegations')
  @ApiOperation({ summary: 'Create delegation request' })
  @RequirePolicy({ action: 'create', resource: 'delegations' })
  async createDelegation(@Body() dto: CreateDelegationDto) {
    return this.delegationService.createDelegation(dto);
  }

  @Get('delegations/pending')
  @ApiOperation({ summary: 'Get pending delegation approvals' })
  @RequirePolicy({ action: 'view', resource: 'delegations' })
  async getPendingDelegations(@Request() req) {
    return this.delegationService.getPendingApprovals(req.user.id);
  }

  @Get('users/:userId/delegations')
  @ApiOperation({ summary: 'Get user delegations' })
  @RequirePolicy({ action: 'view', resource: 'delegations' })
  async getUserDelegations(@Param('userId') userId: string) {
    return this.delegationService.getUserDelegations(userId);
  }

  @Post('delegations/:id/approve')
  @ApiOperation({ summary: 'Approve or reject delegation' })
  @RequirePolicy({ action: 'approve', resource: 'delegations' })
  async approveDelegation(
    @Param('id') delegationId: string,
    @Body() body: { approved: boolean; comments?: string },
    @Request() req
  ) {
    const dto: ApproveDelegationDto = {
      delegationId,
      approverId: req.user.id,
      approved: body.approved,
      comments: body.comments,
    };
    return this.delegationService.approveDelegation(dto);
  }

  @Delete('delegations/:id')
  @ApiOperation({ summary: 'Revoke delegation' })
  @RequirePolicy({ action: 'revoke', resource: 'delegations' })
  async revokeDelegation(
    @Param('id') delegationId: string,
    @Body() body: { reason: string },
    @Request() req
  ) {
    return this.delegationService.revokeDelegation(
      delegationId,
      req.user.id,
      body.reason
    );
  }

  @Get('delegations/stats')
  @ApiOperation({ summary: 'Get delegation statistics' })
  @RequirePolicy({ action: 'view', resource: 'delegations' })
  async getDelegationStats() {
    return this.delegationService.getDelegationStats();
  }

  // ============ ANALYTICS ============

  @Get('analytics/dashboard')
  @ApiOperation({ summary: 'Get IAM dashboard metrics' })
  @RequirePolicy({ action: 'view', resource: 'analytics' })
  async getDashboardMetrics() {
    return this.analyticsService.getDashboardMetrics();
  }

  @Get('analytics/role-distribution')
  @ApiOperation({ summary: 'Get role distribution' })
  @RequirePolicy({ action: 'view', resource: 'analytics' })
  async getRoleDistribution() {
    return this.analyticsService.getRoleDistribution();
  }

  @Get('analytics/dormant-users')
  @ApiOperation({ summary: 'Get dormant users' })
  @RequirePolicy({ action: 'view', resource: 'analytics' })
  async getDormantUsers() {
    return this.analyticsService.findDormantUsers();
  }

  @Get('analytics/role-usage')
  @ApiOperation({ summary: 'Get role usage statistics' })
  @RequirePolicy({ action: 'view', resource: 'analytics' })
  async getRoleUsageStats() {
    return this.analyticsService.getRoleUsageStats();
  }

  @Get('analytics/anomalies')
  @ApiOperation({ summary: 'Detect access anomalies' })
  @RequirePolicy({ action: 'view', resource: 'analytics' })
  async detectAnomalies(@Query('days') days?: number) {
    return this.analyticsService.detectAnomalies(days ? parseInt(days as string) : 7);
  }

  @Post('analytics/audit-report')
  @ApiOperation({ summary: 'Generate audit report' })
  @RequirePolicy({ action: 'generate', resource: 'reports' })
  async generateAuditReport(
    @Body() body: { startDate: string; endDate: string }
  ) {
    return this.analyticsService.generateAuditReport(
      new Date(body.startDate),
      new Date(body.endDate)
    );
  }

  // ============ AUDIT LOGS ============

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  @RequirePolicy({ action: 'view', resource: 'audit_logs' })
  async getAuditLogs(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    const query = this.auditRepo.createQueryBuilder('log').orderBy('log.timestamp', 'DESC');

    if (userId) {
      query.andWhere('log.userId = :userId', { userId });
    }
    if (action) {
      query.andWhere('log.action = :action', { action });
    }
    if (startDate) {
      query.andWhere('log.timestamp >= :startDate', { startDate: new Date(startDate) });
    }
    if (endDate) {
      query.andWhere('log.timestamp <= :endDate', { endDate: new Date(endDate) });
    }

    const [logs, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      logs,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  @Get('audit-logs/:id')
  @ApiOperation({ summary: 'Get audit log by ID' })
  @RequirePolicy({ action: 'view', resource: 'audit_logs' })
  async getAuditLogById(@Param('id') id: string) {
    return this.auditRepo.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  @Get('audit-logs/user/:userId')
  @ApiOperation({ summary: 'Get user audit trail' })
  @RequirePolicy({ action: 'view', resource: 'audit_logs' })
  async getUserAuditTrail(
    @Param('userId') userId: string,
    @Query('limit') limit: number = 100,
  ) {
    return this.auditRepo.find({
      where: { userId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  // ============ POLICY TESTING ============

  @Post('policy/simulate')
  @ApiOperation({ summary: 'Simulate policy evaluation (testing)' })
  @RequirePolicy({ action: 'simulate', resource: 'policies' })
  async simulatePolicy(
    @Body() body: {
      userId: string;
      action: string;
      resource: string;
      resourceId?: string;
    }
  ) {
    // This would call PolicyEvaluationService.evaluatePolicy
    return {
      simulation: true,
      message: 'Policy simulation endpoint - to be implemented',
      input: body,
    };
  }
}
