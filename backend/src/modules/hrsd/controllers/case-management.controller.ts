import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CaseManagementService } from '../services/case-management.service';
import {
  CreateHRCaseDto,
  UpdateHRCaseDto,
  AssignCaseDto,
  ResolveCaseDto,
  AddCaseCommentDto,
  RateCaseDto,
  GetCasesQueryDto,
} from '../dto/hrsd.dto';

@ApiTags('HR Service Delivery - Cases')
@Controller('hrsd/cases')
export class CaseManagementController {
  constructor(private readonly caseService: CaseManagementService) {}

  @Post()
  @ApiOperation({ summary: 'Create HR case' })
  @ApiResponse({ status: 201, description: 'Case created successfully' })
  async createCase(@Body() dto: CreateHRCaseDto) {
    return this.caseService.createCase(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update case' })
  async updateCase(@Param('id') id: string, @Body() dto: UpdateHRCaseDto) {
    return this.caseService.updateCase(id, dto);
  }

  @Post('assign')
  @ApiOperation({ summary: 'Assign case to team member' })
  async assignCase(@Body() dto: AssignCaseDto) {
    return this.caseService.assignCase(dto);
  }

  @Post('resolve')
  @ApiOperation({ summary: 'Resolve case' })
  async resolveCase(@Body() dto: ResolveCaseDto) {
    return this.caseService.resolveCase(dto);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close case' })
  async closeCase(@Param('id') id: string, @Body('closedBy') closedBy: string) {
    return this.caseService.closeCase(id, closedBy);
  }

  @Post(':id/escalate')
  @ApiOperation({ summary: 'Escalate case' })
  async escalateCase(
    @Param('id') id: string,
    @Body('escalatedTo') escalatedTo: string,
    @Body('reason') reason: string,
    @Body('escalatedBy') escalatedBy: string,
  ) {
    return this.caseService.escalateCase(id, escalatedTo, reason, escalatedBy);
  }

  @Post('comments')
  @ApiOperation({ summary: 'Add comment to case' })
  async addComment(@Body() dto: AddCaseCommentDto) {
    return this.caseService.addComment(dto);
  }

  @Post('rate')
  @ApiOperation({ summary: 'Rate case (CSAT)' })
  async rateCase(@Body() dto: RateCaseDto) {
    return this.caseService.rateCase(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get cases' })
  async getCases(@Query() query: GetCasesQueryDto) {
    return this.caseService.getCases(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get case details' })
  async getCaseById(@Param('id') id: string) {
    return this.caseService.getCaseById(id);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get case comments' })
  async getCaseComments(
    @Param('id') id: string,
    @Query('includeInternal') includeInternal?: boolean,
  ) {
    return this.caseService.getCaseComments(id, includeInternal);
  }

  @Get(':id/activities')
  @ApiOperation({ summary: 'Get case activity log' })
  async getCaseActivities(@Param('id') id: string) {
    return this.caseService.getCaseActivities(id);
  }

  @Get('metrics/:organizationId')
  @ApiOperation({ summary: 'Get case metrics and analytics' })
  async getCaseMetrics(
    @Param('organizationId') organizationId: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.caseService.getCaseMetrics(organizationId, startDate, endDate);
  }
}
