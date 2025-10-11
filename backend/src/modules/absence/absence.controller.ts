import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AbsenceService } from './absence.service';
import { CreateAbsenceRequestDto, ApproveAbsenceRequestDto, RejectAbsenceRequestDto, AbsenceRequestQueryDto } from './dto/create-absence-request.dto';
import { CreateSicknessEpisodeDto, UpdateSicknessEpisodeDto } from './dto/create-sickness-episode.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions, CanViewSelf, CanCreate, CanApprove } from '../../common/decorators/permissions.decorator';

@ApiTags('Absence')
@ApiBearerAuth()
@Controller('absence')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AbsenceController {
  constructor(private readonly absenceService: AbsenceService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get all absence plans' })
  @CanViewSelf('absence')
  async getPlans(@Req() req) {
    return this.absenceService.getPlans(req.user.roles);
  }

  @Get('balances')
  @ApiOperation({ summary: 'Get absence balances for current user' })
  @CanViewSelf('absence')
  async getMyBalances(@Req() req, @Query('period') period?: string) {
    const currentYear = period || new Date().getFullYear().toString();
    return this.absenceService.getUserBalances(req.user.id, currentYear);
  }

  @Get('balances/:userId')
  @ApiOperation({ summary: 'Get absence balances for specific user' })
  @RequirePermissions({ feature: 'absence', action: 'view', scope: 'team' })
  async getUserBalances(@Param('userId') userId: string, @Query('period') period?: string) {
    const currentYear = period || new Date().getFullYear().toString();
    return this.absenceService.getUserBalances(userId, currentYear);
  }

  @Post('requests')
  @ApiOperation({ summary: 'Create absence request' })
  @CanCreate('absence')
  async createRequest(@Req() req, @Body() dto: CreateAbsenceRequestDto) {
    return this.absenceService.createRequest(req.user.id, dto);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get absence requests' })
  @CanViewSelf('absence')
  async getRequests(@Req() req, @Query() query: AbsenceRequestQueryDto) {
    // TODO: Implement with filtering
    return { message: 'Get absence requests - to be implemented' };
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get absence request by ID' })
  @CanViewSelf('absence')
  async getRequest(@Param('id') id: string) {
    // TODO: Implement
    return { message: 'Get single absence request - to be implemented' };
  }

  @Post('requests/:id/approve')
  @ApiOperation({ summary: 'Approve absence request' })
  @CanApprove('absence')
  async approveRequest(
    @Param('id') id: string,
    @Req() req,
    @Body() dto: ApproveAbsenceRequestDto,
  ) {
    return this.absenceService.approveRequest(id, req.user.id, dto);
  }

  @Post('requests/:id/reject')
  @ApiOperation({ summary: 'Reject absence request' })
  @CanApprove('absence')
  async rejectRequest(
    @Param('id') id: string,
    @Req() req,
    @Body() dto: RejectAbsenceRequestDto,
  ) {
    return this.absenceService.rejectRequest(id, req.user.id, dto);
  }

  @Post('requests/:id/cancel')
  @ApiOperation({ summary: 'Cancel own absence request' })
  @CanViewSelf('absence')
  async cancelRequest(@Param('id') id: string, @Req() req) {
    return this.absenceService.cancelRequest(id, req.user.id);
  }

  @Post('sickness')
  @ApiOperation({ summary: 'Create sickness episode' })
  @CanCreate('absence')
  async createSicknessEpisode(@Req() req, @Body() dto: CreateSicknessEpisodeDto) {
    return this.absenceService.createSicknessEpisode(req.user.id, dto);
  }

  @Get('sickness')
  @ApiOperation({ summary: 'Get sickness episodes' })
  @CanViewSelf('absence')
  async getSicknessEpisodes(@Req() req, @Query('startDate') startDate?: Date, @Query('endDate') endDate?: Date) {
    return this.absenceService.getSicknessEpisodes(req.user.id, startDate, endDate);
  }

  @Get('sickness/:userId')
  @ApiOperation({ summary: 'Get sickness episodes for user' })
  @RequirePermissions({ feature: 'absence', action: 'view', scope: 'team' })
  async getUserSicknessEpisodes(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
  ) {
    return this.absenceService.getSicknessEpisodes(userId, startDate, endDate);
  }
}
