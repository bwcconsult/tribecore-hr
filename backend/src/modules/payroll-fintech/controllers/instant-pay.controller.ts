import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InstantPayService } from '../services/instant-pay.service';
import { CreateInstantPayRequestDto } from '../dto/instant-pay-request.dto';
import { InstantPayStatus } from '../entities/instant-pay-request.entity';

@ApiTags('Payroll Fintech - Instant Pay')
@Controller('api/v1/fintech/instant-pay')
export class InstantPayController {
  constructor(private readonly instantPayService: InstantPayService) {}

  @Post('requests')
  @ApiOperation({ summary: 'Create instant pay request' })
  async createRequest(@Body() dto: CreateInstantPayRequestDto) {
    return this.instantPayService.createInstantPayRequest(dto);
  }

  @Get('requests/:requestId')
  @ApiOperation({ summary: 'Get instant pay request' })
  async getRequest(@Param('requestId') requestId: string) {
    return this.instantPayService.getRequestById(requestId);
  }

  @Post('requests/:requestId/retry')
  @ApiOperation({ summary: 'Retry failed payment' })
  async retryPayment(@Param('requestId') requestId: string) {
    return this.instantPayService.retryFailedPayment(requestId);
  }

  @Get('employee/:employeeId/requests')
  @ApiOperation({ summary: 'Get employee instant pay requests' })
  async getEmployeeRequests(@Param('employeeId') employeeId: string) {
    return this.instantPayService.getEmployeeRequests(employeeId);
  }

  @Get('organization/:organizationId/requests')
  @ApiOperation({ summary: 'Get organization instant pay requests' })
  async getOrganizationRequests(
    @Param('organizationId') organizationId: string,
    @Query('status') status?: InstantPayStatus,
  ) {
    return this.instantPayService.getOrganizationRequests(organizationId, status);
  }

  @Get('organization/:organizationId/stats')
  @ApiOperation({ summary: 'Get instant pay statistics' })
  async getStats(@Param('organizationId') organizationId: string) {
    return this.instantPayService.getInstantPayStats(organizationId);
  }
}
