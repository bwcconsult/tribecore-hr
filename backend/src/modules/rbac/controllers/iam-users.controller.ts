import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { IamUserService } from '../services/iam-user.service';
import { CreateIamUserDto } from '../dto/create-iam-user.dto';
import { UpdateIamUserDto } from '../dto/update-iam-user.dto';

@Controller('rbac/iam-users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IamUsersController {
  constructor(private readonly iamUserService: IamUserService) {}

  /**
   * Create new IAM user
   * POST /rbac/iam-users
   */
  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  async create(@Body() createDto: CreateIamUserDto, @Req() req: any) {
    const organizationId = req.user.organizationId;
    const createdBy = req.user.userId;
    return await this.iamUserService.create(organizationId, createDto, createdBy);
  }

  /**
   * Get all IAM users
   * GET /rbac/iam-users
   */
  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN', 'HR_MANAGER')
  async findAll(@Req() req: any) {
    const organizationId = req.user.organizationId;
    return await this.iamUserService.findAll(organizationId);
  }

  /**
   * Get IAM user statistics
   * GET /rbac/iam-users/stats
   */
  @Get('stats')
  @Roles('ADMIN', 'SUPER_ADMIN', 'HR_MANAGER')
  async getStats(@Req() req: any) {
    const organizationId = req.user.organizationId;
    return await this.iamUserService.getStats(organizationId);
  }

  /**
   * Check expired users
   * GET /rbac/iam-users/check-expired
   */
  @Get('check-expired')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async checkExpired(@Req() req: any) {
    const organizationId = req.user.organizationId;
    return await this.iamUserService.checkExpiredUsers(organizationId);
  }

  /**
   * Get IAM user by ID
   * GET /rbac/iam-users/:id
   */
  @Get(':id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'HR_MANAGER')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const organizationId = req.user.organizationId;
    return await this.iamUserService.findOne(id, organizationId);
  }

  /**
   * Update IAM user
   * PUT /rbac/iam-users/:id
   */
  @Put(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateIamUserDto,
    @Req() req: any,
  ) {
    const organizationId = req.user.organizationId;
    const modifiedBy = req.user.userId;
    return await this.iamUserService.update(id, organizationId, updateDto, modifiedBy);
  }

  /**
   * Assign roles to IAM user
   * POST /rbac/iam-users/:id/roles
   */
  @Post(':id/roles')
  @Roles('ADMIN', 'SUPER_ADMIN')
  async assignRoles(
    @Param('id') id: string,
    @Body('roles') roles: string[],
    @Req() req: any,
  ) {
    const organizationId = req.user.organizationId;
    const modifiedBy = req.user.userId;
    return await this.iamUserService.assignRoles(id, organizationId, roles, modifiedBy);
  }

  /**
   * Deactivate IAM user
   * POST /rbac/iam-users/:id/deactivate
   */
  @Post(':id/deactivate')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  async deactivate(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    const organizationId = req.user.organizationId;
    const deactivatedBy = req.user.userId;
    return await this.iamUserService.deactivate(id, organizationId, reason, deactivatedBy);
  }

  /**
   * Reactivate IAM user
   * POST /rbac/iam-users/:id/reactivate
   */
  @Post(':id/reactivate')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  async reactivate(@Param('id') id: string, @Req() req: any) {
    const organizationId = req.user.organizationId;
    const modifiedBy = req.user.userId;
    return await this.iamUserService.reactivate(id, organizationId, modifiedBy);
  }

  /**
   * Suspend IAM user
   * POST /rbac/iam-users/:id/suspend
   */
  @Post(':id/suspend')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  async suspend(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    const organizationId = req.user.organizationId;
    const modifiedBy = req.user.userId;
    return await this.iamUserService.suspend(id, organizationId, reason, modifiedBy);
  }

  /**
   * Regenerate API key for service account
   * POST /rbac/iam-users/:id/regenerate-api-key
   */
  @Post(':id/regenerate-api-key')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  async regenerateApiKey(@Param('id') id: string, @Req() req: any) {
    const organizationId = req.user.organizationId;
    const modifiedBy = req.user.userId;
    return await this.iamUserService.regenerateApiKey(id, organizationId, modifiedBy);
  }

  /**
   * Delete IAM user
   * DELETE /rbac/iam-users/:id
   */
  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @Req() req: any) {
    const organizationId = req.user.organizationId;
    await this.iamUserService.delete(id, organizationId);
  }
}
