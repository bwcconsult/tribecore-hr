import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserSettingsService } from './user-settings.service';
import {
  UpdateUserSettingsDto,
  UpdateNotificationPreferenceDto,
  UpdateNotificationSubscriptionDto,
  CreateNotificationDto,
} from './dto/user-settings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('User Settings')
@Controller('user-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserSettingsController {
  constructor(private readonly service: UserSettingsService) {}

  // ==================== USER SETTINGS ====================

  @Get('me')
  @ApiOperation({ summary: 'Get my settings' })
  getMySettings(@CurrentUser() user: any) {
    return this.service.getSettings(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my settings' })
  updateMySettings(
    @Body() dto: UpdateUserSettingsDto,
    @CurrentUser() user: any,
  ) {
    return this.service.updateSettings(user.id, dto);
  }

  // ==================== NOTIFICATION PREFERENCES ====================

  @Get('notifications/preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  getNotificationPreference(@CurrentUser() user: any) {
    return this.service.getNotificationPreference(user.id);
  }

  @Patch('notifications/preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  updateNotificationPreference(
    @Body() dto: UpdateNotificationPreferenceDto,
    @CurrentUser() user: any,
  ) {
    return this.service.updateNotificationPreference(user.id, dto);
  }

  // ==================== NOTIFICATION SUBSCRIPTIONS ====================

  @Get('notifications/subscriptions')
  @ApiOperation({ summary: 'Get notification subscriptions' })
  getNotificationSubscriptions(@CurrentUser() user: any) {
    return this.service.getNotificationSubscriptions(user.id);
  }

  @Patch('notifications/subscriptions/:key')
  @ApiOperation({ summary: 'Update notification subscription' })
  updateNotificationSubscription(
    @Param('key') key: string,
    @Body() dto: UpdateNotificationSubscriptionDto,
    @CurrentUser() user: any,
  ) {
    return this.service.updateNotificationSubscription(user.id, key, dto);
  }

  // ==================== NOTIFICATIONS ====================

  @Get('notifications')
  @ApiOperation({ summary: 'Get my notifications' })
  getUserNotifications(
    @Query('limit') limit: number,
    @CurrentUser() user: any,
  ) {
    return this.service.getUserNotifications(user.id, limit || 50);
  }

  @Post('notifications')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Queue notification (Admin)' })
  queueNotification(@Body() dto: CreateNotificationDto) {
    return this.service.queueNotification(dto);
  }

  @Get('notifications/pending')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get pending notifications (Admin)' })
  getPendingNotifications(@Query('limit') limit: number) {
    return this.service.getPendingNotifications(limit || 100);
  }

  @Patch('notifications/:id/sent')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Mark notification as sent (Admin)' })
  markNotificationAsSent(@Param('id') id: string) {
    return this.service.markNotificationAsSent(id);
  }
}
