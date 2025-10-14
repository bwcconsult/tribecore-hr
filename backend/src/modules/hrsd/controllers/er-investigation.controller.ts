import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ERInvestigationService } from '../services/er-investigation.service';
import {
  CreateERInvestigationDto,
  UpdateERInvestigationDto,
  AddInvestigationNoteDto,
  RecordInterviewDto,
  ConcludeInvestigationDto,
} from '../dto/hrsd.dto';

@ApiTags('HR Service Delivery - ER Investigations')
@Controller('hrsd/investigations')
export class ERInvestigationController {
  constructor(private readonly erService: ERInvestigationService) {}

  @Post()
  @ApiOperation({ summary: 'Create ER investigation' })
  @ApiResponse({ status: 201, description: 'Investigation created successfully' })
  async createInvestigation(@Body() dto: CreateERInvestigationDto) {
    return this.erService.createInvestigation(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update investigation' })
  async updateInvestigation(
    @Param('id') id: string,
    @Body() dto: UpdateERInvestigationDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'system';
    return this.erService.updateInvestigation(id, dto, userId);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start investigation' })
  async startInvestigation(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Body('targetCompletionDate') targetCompletionDate: Date,
  ) {
    return this.erService.startInvestigation(id, userId, targetCompletionDate);
  }

  @Post('notes')
  @ApiOperation({ summary: 'Add investigation note' })
  async addNote(@Body() dto: AddInvestigationNoteDto, @Req() req: any) {
    const userId = req.user?.id || dto.authorId;
    return this.erService.addNote(dto, userId);
  }

  @Post(':id/evidence')
  @ApiOperation({ summary: 'Add evidence to investigation' })
  async addEvidence(
    @Param('id') id: string,
    @Body() evidence: any,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'system';
    return this.erService.addEvidence(id, evidence, userId);
  }

  @Post('interviews')
  @ApiOperation({ summary: 'Record interview' })
  async recordInterview(@Body() dto: RecordInterviewDto, @Req() req: any) {
    const userId = req.user?.id || dto.interviewerId;
    return this.erService.recordInterview(dto, userId);
  }

  @Post('conclude')
  @ApiOperation({ summary: 'Conclude investigation' })
  async concludeInvestigation(@Body() dto: ConcludeInvestigationDto, @Req() req: any) {
    const userId = req.user?.id || 'system';
    return this.erService.concludeInvestigation(dto, userId);
  }

  @Post(':id/notify/:party')
  @ApiOperation({ summary: 'Notify parties of outcome' })
  async notifyParties(
    @Param('id') id: string,
    @Param('party') party: 'COMPLAINANT' | 'RESPONDENT',
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'system';
    return this.erService.notifyParties(id, party, userId);
  }

  @Post(':id/close')
  @ApiOperation({ summary: 'Close investigation' })
  async closeInvestigation(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || 'system';
    return this.erService.closeInvestigation(id, userId);
  }

  @Post(':id/legal-review')
  @ApiOperation({ summary: 'Request legal review' })
  async requestLegalReview(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || 'system';
    return this.erService.requestLegalReview(id, userId);
  }

  @Post(':id/legal-review/complete')
  @ApiOperation({ summary: 'Complete legal review' })
  async completeLegalReview(
    @Param('id') id: string,
    @Body('reviewedBy') reviewedBy: string,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'system';
    return this.erService.completeLegalReview(id, reviewedBy, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get investigation details' })
  async getInvestigation(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || 'system';
    return this.erService.getInvestigation(id, userId);
  }

  @Get('organization/:organizationId')
  @ApiOperation({ summary: 'Get investigations for organization' })
  async getInvestigationsByOrg(
    @Param('organizationId') organizationId: string,
    @Req() req: any,
  ) {
    const userId = req.user?.id || 'system';
    return this.erService.getInvestigationsByOrg(organizationId, userId);
  }

  @Get(':id/notes')
  @ApiOperation({ summary: 'Get investigation notes' })
  async getInvestigationNotes(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || 'system';
    return this.erService.getInvestigationNotes(id, userId);
  }

  @Get('metrics/:organizationId')
  @ApiOperation({ summary: 'Get investigation metrics' })
  async getInvestigationMetrics(@Param('organizationId') organizationId: string) {
    return this.erService.getInvestigationMetrics(organizationId);
  }
}
