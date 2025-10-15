import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EWAService } from '../services/ewa.service';
import { CreateEWARequestDto, ApproveEWARequestDto, RejectEWARequestDto } from '../dto/ewa-request.dto';
import { EWARequestStatus } from '../entities/ewa-request.entity';

@ApiTags('Payroll Fintech - Earned Wage Access')
@Controller('api/v1/fintech/ewa')
export class EWAController {
  constructor(private readonly ewaService: EWAService) {}

  @Post('requests')
  @ApiOperation({ summary: 'Create EWA request' })
  async createRequest(@Body() dto: CreateEWARequestDto) {
    return this.ewaService.createEWARequest(dto);
  }

  @Get('requests/:requestId')
  @ApiOperation({ summary: 'Get EWA request by ID' })
  async getRequest(@Param('requestId') requestId: string) {
    return this.ewaService.getRequestById(requestId);
  }

  @Patch('requests/:requestId/approve')
  @ApiOperation({ summary: 'Approve EWA request' })
  async approveRequest(
    @Param('requestId') requestId: string,
    @Body() dto: ApproveEWARequestDto,
  ) {
    return this.ewaService.approveEWARequest(requestId, dto);
  }

  @Patch('requests/:requestId/reject')
  @ApiOperation({ summary: 'Reject EWA request' })
  async rejectRequest(
    @Param('requestId') requestId: string,
    @Body() dto: RejectEWARequestDto,
  ) {
    return this.ewaService.rejectEWARequest(requestId, dto);
  }

  @Post('requests/:requestId/disburse')
  @ApiOperation({ summary: 'Manually disburse approved EWA request' })
  async disburseRequest(@Param('requestId') requestId: string) {
    return this.ewaService.disburseEWA(requestId);
  }

  @Get('employee/:employeeId/requests')
  @ApiOperation({ summary: 'Get employee EWA requests' })
  async getEmployeeRequests(@Param('employeeId') employeeId: string) {
    return this.ewaService.getEmployeeRequests(employeeId);
  }

  @Get('organization/:organizationId/requests')
  @ApiOperation({ summary: 'Get organization EWA requests' })
  async getOrganizationRequests(
    @Param('organizationId') organizationId: string,
    @Query('status') status?: EWARequestStatus,
  ) {
    return this.ewaService.getOrganizationRequests(organizationId, status);
  }

  @Get('organization/:organizationId/stats')
  @ApiOperation({ summary: 'Get EWA statistics' })
  async getStats(@Param('organizationId') organizationId: string) {
    return this.ewaService.getEWAStats(organizationId);
  }
}
