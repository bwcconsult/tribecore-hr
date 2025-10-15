import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { NotificationsService } from '../services/notifications.service';
import { NotificationPreferencesService } from '../services/notification-preferences.service';
import { Notification } from '../entities/notification.entity';
import { seedNotifications } from '../seed-notifications';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly preferencesService: NotificationPreferencesService,
  ) {}

  /**
   * Get user's notifications
   * GET /api/notifications/my-notifications
   */
  @Get('my-notifications')
  async getMyNotifications(
    @Req() req: any,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ): Promise<Notification[]> {
    const userId = req.user.id;
    const isUnreadOnly = unreadOnly === 'true';
    const limitNum = limit ? parseInt(limit, 10) : 50;

    return this.notificationsService.getByUser(userId, isUnreadOnly, type, limitNum);
  }

  /**
   * Get unread count
   * GET /api/notifications/unread-count
   */
  @Get('unread-count')
  async getUnreadCount(@Req() req: any): Promise<{ count: number }> {
    const userId = req.user.id;
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  /**
   * Get notification statistics
   * GET /api/notifications/stats
   */
  @Get('stats')
  async getStats(@Req() req: any) {
    const userId = req.user.id;
    return this.notificationsService.getStats(userId);
  }

  /**
   * Mark notification as read
   * PUT /api/notifications/:id/read
   */
  @Put(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Param('id') notificationId: string,
    @Req() req: any,
  ): Promise<Notification> {
    const userId = req.user.id;
    return this.notificationsService.markAsRead(notificationId, userId);
  }

  /**
   * Mark all notifications as read
   * PUT /api/notifications/mark-all-read
   */
  @Put('mark-all-read')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Req() req: any): Promise<{ message: string }> {
    const userId = req.user.id;
    await this.notificationsService.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  }

  /**
   * Delete a notification
   * DELETE /api/notifications/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNotification(
    @Param('id') notificationId: string,
    @Req() req: any,
  ): Promise<void> {
    const userId = req.user.id;
    await this.notificationsService.delete(notificationId, userId);
  }

  /**
   * Delete all read notifications
   * DELETE /api/notifications/clear-read
   */
  @Delete('clear-read')
  @HttpCode(HttpStatus.OK)
  async clearRead(@Req() req: any): Promise<{ message: string; deleted: number }> {
    const userId = req.user.id;
    const deleted = await this.notificationsService.deleteAllRead(userId);
    return { message: 'Read notifications cleared', deleted };
  }

  /**
   * Get notification preferences
   * GET /api/notifications/preferences
   */
  @Get('preferences')
  async getPreferences(@Req() req: any) {
    const userId = req.user.id;
    return this.preferencesService.getPreferences(userId);
  }

  /**
   * Update notification preferences
   * PUT /api/notifications/preferences
   */
  @Put('preferences')
  async updatePreferences(
    @Req() req: any,
    @Body() preferences: any,
  ) {
    const userId = req.user.id;
    return this.preferencesService.updatePreferences(userId, preferences);
  }

  /**
   * Test notification (development only)
   * POST /api/notifications/test
   */
  @Post('test')
  async testNotification(@Req() req: any, @Body() body: any) {
    const userId = req.user.id;
    return this.notificationsService.create({
      recipientId: userId,
      organizationId: req.user.organizationId,
      type: body.type || 'SYSTEM',
      priority: body.priority || 'MEDIUM',
      title: body.title || 'Test Notification',
      message: body.message || 'This is a test notification',
      linkUrl: body.linkUrl,
    });
  }

  /**
   * Seed sample notifications (development/testing only)
   * POST /api/v1/notifications/seed
   */
  @Post('seed')
  @HttpCode(HttpStatus.OK)
  async seedNotifications(@Req() req: any) {
    const userId = req.user.id;
    const organizationId = req.user.organizationId;

    await seedNotifications(this.notificationsService, userId, organizationId);

    return {
      message: '20 sample notifications created successfully',
      userId,
      organizationId,
    };
  }
}
