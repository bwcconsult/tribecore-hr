import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SeparationService } from '../services/separation.service';
import { CreateSeparationCaseDto } from '../dto/create-separation-case.dto';
import { CalculateSeveranceDto } from '../dto/calculate-severance.dto';
import { SeparationStatus } from '../entities/separation-case.entity';

@ApiTags('Offboarding')
@Controller('offboarding')
export class SeparationController {
  constructor(private readonly separationService: SeparationService) {}

  @Post('cases')
  @ApiOperation({ summary: 'Create separation case' })
  @ApiResponse({ status: 201, description: 'Case created successfully' })
  async createCase(@Body() dto: CreateSeparationCaseDto) {
    return this.separationService.createCase(dto);
  }

  @Get('cases')
  @ApiOperation({ summary: 'Get separation cases' })
  async getCases(
    @Query('organizationId') organizationId: string,
    @Query('status') status?: SeparationStatus,
  ) {
    return this.separationService.getCasesByStatus(organizationId, status);
  }

  @Get('cases/:id')
  @ApiOperation({ summary: 'Get case details' })
  async getCaseDetails(@Param('id') id: string) {
    return this.separationService.getCaseDetails(id);
  }

  @Post('cases/:id/approve')
  @ApiOperation({ summary: 'Approve separation case' })
  async approveCase(
    @Param('id') id: string,
    @Body('approvedBy') approvedBy: string,
  ) {
    return this.separationService.approveCase(id, approvedBy);
  }

  @Post('cases/:id/notice')
  @ApiOperation({ summary: 'Calculate notice terms' })
  async calculateNotice(
    @Param('id') caseId: string,
    @Body('tenureYears') tenureYears: number,
    @Body('contractualDays') contractualDays: number,
    @Body('country') country: string,
  ) {
    return this.separationService.calculateNotice(
      caseId,
      tenureYears,
      contractualDays,
      country,
    );
  }

  @Post('cases/:id/severance')
  @ApiOperation({ summary: 'Calculate severance package' })
  async calculateSeverance(
    @Param('id') caseId: string,
    @Body() dto: CalculateSeveranceDto,
  ) {
    return this.separationService.calculateSeverance(caseId, dto);
  }

  @Post('cases/:id/complete')
  @ApiOperation({ summary: 'Complete offboarding' })
  async completeCase(@Param('id') id: string) {
    return this.separationService.completeCase(id);
  }
}
