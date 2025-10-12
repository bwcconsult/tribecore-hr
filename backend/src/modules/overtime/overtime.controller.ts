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
import { OvertimeService } from './overtime.service';
import { CreateOvertimeRequestDto, CreateOvertimePolicyDto } from './dto/create-overtime.dto';
import { OvertimeStatus } from './entities/overtime-request.entity';

@Controller('overtime')
export class OvertimeController {
  constructor(private readonly overtimeService: OvertimeService) {}

  // ===== OVERTIME REQUESTS =====

  @Post('requests')
  async createOvertimeRequest(@Body() createDto: CreateOvertimeRequestDto) {
    return this.overtimeService.createOvertimeRequest(createDto);
  }

  @Get('requests')
  async findAllOvertimeRequests(
    @Query('organizationId') organizationId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: OvertimeStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.overtimeService.findAllOvertimeRequests({
      organizationId,
      employeeId,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('requests/:id')
  async getOvertimeRequestById(@Param('id') id: string) {
    return this.overtimeService.getOvertimeRequestById(id);
  }

  @Post('requests/:id/approve')
  async approveOvertimeRequest(
    @Param('id') id: string,
    @Body() body: { hourlyRate?: number },
    @Request() req,
  ) {
    return this.overtimeService.approveOvertimeRequest(id, req.user?.id || 'system', body.hourlyRate);
  }

  @Post('requests/:id/reject')
  async rejectOvertimeRequest(
    @Param('id') id: string,
    @Body('rejectionReason') rejectionReason: string,
  ) {
    return this.overtimeService.rejectOvertimeRequest(id, rejectionReason);
  }

  @Post('requests/:id/cancel')
  async cancelOvertimeRequest(@Param('id') id: string, @Request() req) {
    return this.overtimeService.cancelOvertimeRequest(id, req.user?.id);
  }

  @Post('requests/:id/paid')
  async markAsPaid(@Param('id') id: string, @Body('payrollId') payrollId: string) {
    return this.overtimeService.markAsPaid(id, payrollId);
  }

  // ===== POLICIES =====

  @Post('policies')
  async createPolicy(@Body() createDto: CreateOvertimePolicyDto) {
    return this.overtimeService.createPolicy(createDto);
  }

  @Get('policies/organization/:organizationId')
  async getActivePolicy(@Param('organizationId') organizationId: string) {
    return this.overtimeService.getActivePolicy(organizationId);
  }

  @Get('policies/:id')
  async getPolicyById(@Param('id') id: string) {
    return this.overtimeService.getPolicyById(id);
  }

  @Put('policies/:id')
  async updatePolicy(@Param('id') id: string, @Body() updateDto: Partial<CreateOvertimePolicyDto>) {
    return this.overtimeService.updatePolicy(id, updateDto);
  }

  // ===== ANALYTICS =====

  @Get('analytics/employee/:employeeId')
  async getEmployeeOvertimeStats(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.overtimeService.getEmployeeOvertimeStats(
      employeeId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('analytics/organization/:organizationId')
  async getOrganizationOvertimeAnalytics(
    @Param('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.overtimeService.getOrganizationOvertimeAnalytics(
      organizationId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
