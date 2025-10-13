import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivityLogService } from '../services/activity-log.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('sign/activity-logs')
@UseGuards(JwtAuthGuard)
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  findAll(@Query() filters: any) {
    return this.activityLogService.findAll(filters);
  }

  @Get('statistics')
  getStatistics(@Query() filters: any) {
    return this.activityLogService.getStatistics(filters);
  }
}
