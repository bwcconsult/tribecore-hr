import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  StreamableFile,
  Header,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { CalendarQueryDto, CalendarExportDto, AnnualOverviewDto, ICSSubscriptionDto } from './dto/calendar-query.dto';
import { CreateBankHolidayDto, UpdateBankHolidayDto } from './dto/create-bank-holiday.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Calendar')
@Controller('calendar')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('events')
  @ApiOperation({ summary: 'Get calendar events with role-based filtering' })
  @ApiQuery({ name: 'from', required: true, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'to', required: true, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'scope', required: false, enum: ['SELF', 'DIRECT_REPORTS', 'TEAM', 'ORGANIZATION', 'PEERS', 'MANAGER'] })
  @ApiQuery({ name: 'types', required: false, isArray: true })
  @ApiQuery({ name: 'userIds', required: false, isArray: true })
  @ApiQuery({ name: 'region', required: false })
  async getEvents(
    @Query() query: CalendarQueryDto,
    @CurrentUser() user: any,
  ) {
    return this.calendarService.getEvents(query, user);
  }

  @Get('annual-overview')
  @ApiOperation({ summary: 'Get annual overview for a user' })
  @ApiQuery({ name: 'year', required: true, description: 'Year (YYYY)' })
  @ApiQuery({ name: 'userId', required: false, description: 'User ID (defaults to self)' })
  async getAnnualOverview(
    @Query() dto: AnnualOverviewDto,
    @CurrentUser() user: any,
  ) {
    return this.calendarService.getAnnualOverview(dto, user);
  }

  @Get('balances/:userId')
  @ApiOperation({ summary: 'Get absence balances with rolling windows' })
  async getAbsenceBalances(
    @Param('userId') userId: string,
    @CurrentUser() user: any,
  ) {
    return this.calendarService.getAbsenceBalances(userId, user);
  }

  @Get('balances/me')
  @ApiOperation({ summary: 'Get my absence balances' })
  async getMyAbsenceBalances(@CurrentUser() user: any) {
    return this.calendarService.getAbsenceBalances(user.id, user);
  }

  @Post('export/pdf')
  @ApiOperation({ summary: 'Export calendar view to PDF' })
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="calendar.pdf"')
  async exportToPDF(
    @Body() dto: CalendarExportDto,
    @CurrentUser() user: any,
  ): Promise<StreamableFile> {
    // TODO: Implement PDF generation
    // This will use a library like puppeteer or pdfkit
    throw new Error('PDF export not yet implemented');
  }

  @Get('export/ics')
  @ApiOperation({ summary: 'Get ICS subscription URL' })
  @Header('Content-Type', 'text/calendar')
  @Header('Content-Disposition', 'attachment; filename="calendar.ics"')
  async exportToICS(
    @Query() dto: ICSSubscriptionDto,
    @CurrentUser() user: any,
  ) {
    // TODO: Implement ICS generation
    // This will use a library like ical-generator
    throw new Error('ICS export not yet implemented');
  }

  // Bank Holiday Management (Admin only)

  @Post('bank-holidays')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Create bank holiday' })
  async createBankHoliday(
    @Body() dto: CreateBankHolidayDto,
    @CurrentUser() user: any,
  ) {
    return this.calendarService.createBankHoliday(dto, user);
  }

  @Get('bank-holidays')
  @ApiOperation({ summary: 'Get all bank holidays' })
  @ApiQuery({ name: 'region', required: false })
  async getAllBankHolidays(@Query('region') region?: string) {
    return this.calendarService.getAllBankHolidays(region);
  }

  @Patch('bank-holidays/:id')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Update bank holiday' })
  async updateBankHoliday(
    @Param('id') id: string,
    @Body() dto: UpdateBankHolidayDto,
  ) {
    return this.calendarService.updateBankHoliday(id, dto);
  }

  @Delete('bank-holidays/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete bank holiday' })
  async deleteBankHoliday(@Param('id') id: string) {
    return this.calendarService.deleteBankHoliday(id);
  }
}
