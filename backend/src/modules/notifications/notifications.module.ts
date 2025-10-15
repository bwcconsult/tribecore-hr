import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './services/email.service';
import { NotificationsService } from './services/notifications.service';
import { NotificationPreferencesService } from './services/notification-preferences.service';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationsController } from './controllers/notifications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, NotificationPreference])],
  providers: [EmailService, NotificationsService, NotificationPreferencesService],
  controllers: [NotificationsController],
  exports: [EmailService, NotificationsService, NotificationPreferencesService],
})
export class NotificationsModule {}
