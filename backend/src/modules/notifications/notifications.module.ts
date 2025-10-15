import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './services/email.service';
import { NotificationsService } from './services/notifications.service';
import { NotificationPreferencesService } from './services/notification-preferences.service';
import { NotificationHelperService } from './services/notification-helper.service';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationsController } from './controllers/notifications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, NotificationPreference])],
  providers: [
    EmailService,
    NotificationsService,
    NotificationPreferencesService,
    NotificationHelperService,
  ],
  controllers: [NotificationsController],
  exports: [
    EmailService,
    NotificationsService,
    NotificationPreferencesService,
    NotificationHelperService,
  ],
})
export class NotificationsModule {}
